<template>
  <div>
    <v-col v-if="currentUser.isStaff">
      <!-- <hr />
      <br /> -->
      <v-expansion-panels>
        <!-- Scan Upload -->
        <!-- <v-expansion-panel>
          <v-expansion-panel-header>
            <div class="text-center">Upload</div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card>
              <v-card-text>
                <scan-upload
                  :subject="subject"
                  @file-upload-complete="update()"
                />
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel> -->

        <!-- Study Group Association -->
        <v-expansion-panel>
          <v-expansion-panel-header>
            <div class="text-center">Study Group Association</div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card>
              <v-card-text>
                <group-association :selectedScans="selected" />
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- <br />
      <hr /> -->
    </v-col>

    <!-- Scan Preview -->
    <div :key="scanPreviewKey">
      <script :id="scanPreviewId" type="application/javascript"></script>
    </div>

    <!-- Scan Table -->
    <v-data-table
      v-model="selected"
      item-key="id"
      show-select
      multi-sort
      :footer-props="{
        'items-per-page-options': itemsPerPageOptions
      }"
      :headers="headers"
      :loading="loading"
      :items="scans"
      :options.sync="options"
      :server-items-length="totalScanCount"
    >
      <template v-slot:top>
        <scan-table-controls
          ref="tableController"
          :options="options"
          :subject="subject"
          :session="session"
          @fetch-scans-start="loading = true"
          @fetch-scans-end="loading = false"
        />
      </template>

      <!-- Subject ID button opening subject info dialog -->
      <template v-slot:item.subject="{ item }">
        <div class="py-1">
          <v-dialog v-model="editSubjectDialog[item.subject.id]" width="600px">
            <template v-slot:activator="{ on }">
              <v-btn small color="info" v-on="on">
                {{ item.subject.idNumber }}
              </v-btn>
            </template>
            <subject-info-card
              :subjectId="item.subject.id"
              @close-subject-dialog="editSubjectDialog[item.subject.id] = false"
            />
          </v-dialog>
        </div>
      </template>

      <!-- Date -->
      <template v-slot:item.date="{ item }">{{
        formatDate(item.time)
      }}</template>

      <!-- Time -->
      <template v-slot:item.time="{ item }">{{
        formatTime(item.time)
      }}</template>

      <!-- Sequence Type -->
      <template v-slot:item.sequenceType="{ item }">
        <!-- Existing -->
        <div v-if="item.sequenceType" class="py-1">
          <v-dialog v-model="sequenceTypeDialog[item.id]" width="800px">
            <template v-slot:activator="{ on }">
              <v-btn small class="info" v-on="on">{{
                item.sequenceType.title
              }}</v-btn>
            </template>
            <protocol-information :scan="item" />
          </v-dialog>
        </div>
        <!-- Create -->
        <div v-else class="py-1">
          <v-dialog v-model="sequenceTypeDialog[item.id]" width="400px">
            <template v-slot:activator="{ on }">
              <v-btn small class="warning" v-on="on">Create</v-btn>
            </template>
            <edit-sequence-type
              :fromScan="item"
              @close-dialog="sequenceTypeDialog[item.id] = false"
              @created-sequence-type="update"
            />
          </v-dialog>
        </div>
      </template>

      <!-- Spatial Resolution -->
      <template v-slot:item.spatialResolution="{ item }">
        {{ formatSpatialResolution(item.spatialResolution) }}
      </template>

      <!-- Study Groups -->
      <template v-slot:item.studyGroups="{ item }">
        <div v-for="groupId in item.studyGroups" :key="groupId" class="py-1">
          <v-chip
            small
            close
            @click:close="disassociateFromGroup(item, groupId)"
          >
            {{ stringifyGroup(getGroupById(groupId)) }}
          </v-chip>
        </div>
      </template>

      <!-- Preview -->
      <template v-slot:item.preview="{ item }">
        <v-btn small class="warning" @click="loadPreview(item.id)">
          Preview
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { scanPreviewScript } from '@/api/mri/endpoints'
import EditSequenceType from '@/components/mri/edit-sequence-type.vue'
import GroupAssociation from '@/components/mri/group-association.vue'
import ProtocolInformation from '@/components/dicom/protocol-information.vue'
import SubjectInfoCard from '@/components/research/subject-info-card.vue'
// import ScanUpload from '@/components/mri/scan-upload.vue'
import ScanTableControls from '@/components/mri/scan-table-controls.vue'
import VueScript2 from 'vue-script2'

export default {
  name: 'ScanTable',
  props: {
    subject: { type: Object, default: undefined },
    session: { type: Object, default: undefined }
  },
  components: {
    EditSequenceType,
    GroupAssociation,
    ProtocolInformation,
    ScanTableControls,
    SubjectInfoCard
    // ScanUpload
  },
  mounted() {
    this.fetchSequenceTypes()
    let groupQuery = { filters: {}, options: {} }
    this.fetchGroups(groupQuery)
    if (this.subject != undefined) {
      this.headers.splice(0, 1)
    }
  },
  data: () => ({
    sequenceTypeDialog: {},
    headers: [
      { text: 'Subject', value: 'subject' },
      { text: 'Date', value: 'date' },
      { text: 'Time', value: 'time' },
      { text: 'Number', value: 'number' },
      { text: 'Description', value: 'description' },
      {
        text: 'Sequence Type',
        value: 'sequenceType',
        sortable: false,
        align: 'center'
      },
      {
        text: 'Spatial Resolution (mm)',
        value: 'spatialResolution',
        sortable: false
      },
      { text: 'Study Groups', value: 'studyGroups', sortable: false },
      { text: 'Preview', value: 'preview', sortable: false }
    ],
    selected: [],
    options: {
      page: 1,
      sortBy: ['date', 'time'],
      sortDesc: [true, false],
      itemsPerPage: 25
    },
    itemsPerPageOptions: [10, 25, 50, -1],
    loading: false,
    scanPreviewKey: 0,
    editSubjectDialog: {}
  }),
  computed: {
    scanPreviewId: function() {
      return `scan-preview-${this.scanPreviewKey}`
    },
    ...mapState('auth', { currentUser: 'user' }),
    ...mapState('mri', ['scans', 'totalScanCount', 'scanPreviewLoader']),
    ...mapGetters('research', ['getGroupById'])
  },
  methods: {
    disassociateFromGroup(scan, groupId) {
      const index = scan.studyGroups.indexOf(groupId)
      if (index > -1) {
        scan.studyGroups.splice(index, 1)
      }
      let data = { scanId: scan.id, studyGroups: scan.studyGroups }
      this.updateScan(data)
    },
    formatSpatialResolution(floatArray) {
      return floatArray
        ? floatArray
            .map(item => parseFloat(item.toFixed(2)))
            .toString()
            .replace(/,/g, ' x ')
            .trim()
        : null
    },
    formatDate(scanTime) {
      if (!scanTime) return null
      let [year, month, day] = scanTime.slice(0, 10).split('-')
      return `${day}/${month}/${year}`
    },
    formatTime(scanTime) {
      if (!scanTime) return null
      return scanTime.slice(11, 23)
    },
    stringifyGroup(group) {
      return group ? `${group.study.title} | ${group.title}` : null
    },
    update() {
      this.$refs.tableController.update()
    },
    loadPreview(scanId) {
      this.scanPreviewKey += 1
      let src = scanPreviewScript(scanId, this.scanPreviewId)
      VueScript2.load(src)
    },
    ...mapActions('mri', ['fetchSequenceTypes', 'updateScan']),
    ...mapActions('research', ['fetchGroups'])
  }
}
</script>

<style scoped></style>
