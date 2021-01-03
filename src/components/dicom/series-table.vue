<template>
  <v-col>
    <series-table-controls
      ref="tableController"
      :options="options"
      :patient="patient"
      @fetch-series-start="loading = true"
      @fetch-series-end="loading = false"
    />
    <v-data-table
      dense
      item-key="id"
      v-model="selectedSeries"
      :headers="headers"
      :items="seriesList"
      :loading="loading"
      :options.sync="options"
      :server-items-length="seriesCount"
      :footer-props="{
        itemsPerPageOptions
      }"
    >
      <!-- Date -->
      <template v-slot:item.date="{ item }">{{
        item.date.slice(0, 10) | formatDate
      }}</template>

      <!-- Time -->
      <template v-slot:item.time="{ item }">{{
        item.time.slice(0, 8)
      }}</template>

      <!-- Sequence Type -->
      <template v-slot:item.sequenceType="{ item }">
        <div class="py-1">
          <v-dialog v-model="protocolInformationDialog[item.id]" width="800px">
            <template v-slot:activator="{ on }">
              <v-btn small class="info" v-on="on">{{
                getSequenceTypeTitle(item)
              }}</v-btn>
            </template>
            <protocol-information :series="item" />
          </v-dialog>
        </div>
      </template>

      <!-- Spatial Resolution -->
      <template v-slot:item.spatialResolution="{ item }">{{
        getSpatialResolution(item)
      }}</template>

      <!-- Scan Instance Dialog -->
      <template v-slot:item.scanInstance="{ item }">
        <div class="py-1">
          <v-dialog
            v-if="getScanByDicomSeries(item)"
            v-model="scanInfoDialog[item.id]"
            width="500px"
          >
            <template v-slot:activator="{ on }">
              <v-btn small color="success" v-on="on">{{
                `Scan #${getScanByDicomSeries(item).id}`
              }}</v-btn>
            </template>
            <scan-info
              :existingScan="getScanByDicomSeries(item)"
              :dicom="item"
              @close-scan-dialog="scanInfoDialog[item.id] = false"
            />
          </v-dialog>
        </div>
      </template>

      <!-- Scanning Sequence -->
      <template v-slot:item.scanningSequence="{ item }">
        <v-chip
          small
          v-for="(sequence, index) in item.scanningSequence"
          :key="index"
        >
          <v-avatar :color="scanningSequences[sequence].color">{{
            sequence
          }}</v-avatar>
        </v-chip>
      </template>

      <!-- Sequence Variants -->
      <template v-slot:item.sequenceVariant="{ item }">
        <v-chip
          small
          v-for="(variant, index) in item.sequenceVariant"
          :key="index"
        >
          <v-avatar :color="sequenceVariants[variant].color">{{
            variant
          }}</v-avatar>
        </v-chip>
      </template>
    </v-data-table>
  </v-col>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { formatSpatialResolution } from '@/components/dicom/utils'
import { scanningSequences, sequenceVariants } from '@/components/mri/utils'
import ProtocolInformation from './protocol-information.vue'
import SeriesTableControls from '@/components/dicom/series-table-controls.vue'
import ScanInfo from '@/components/mri/scan-info.vue'

export default {
  name: 'SeriesTable',
  props: { patient: Object },
  components: { ProtocolInformation, ScanInfo, SeriesTableControls },
  data: () => ({
    protocolInformationDialog: {},
    scanInfoDialog: {},
    studyGroups: {},
    selectedSeries: [],
    scanningSequences,
    sequenceVariants,
    headers: [
      { text: 'ID', value: 'id', soratble: true },
      {
        text: 'Description',
        value: 'description',
        sortable: true
      },
      {
        text: 'Date',
        value: 'date',
        align: 'center'
      },
      {
        text: 'Time',
        value: 'time',
        align: 'center'
      },
      {
        text: 'Sequence Type',
        value: 'sequenceType',
        sortable: false,
        align: 'center'
      },
      {
        text: 'Spatial Resolution (mm)',
        value: 'spatialResolution',
        sortable: false,
        align: 'center'
      },
      {
        text: 'Pulse Sequence Name',
        value: 'pulseSequenceName',
        sortable: true
      },
      {
        text: 'Sequence Name',
        value: 'sequenceName',
        sortable: true
      },
      {
        text: 'Manufacturer',
        value: 'manufacturer',
        sortable: true
      },
      {
        text: 'Scanning Sequence',
        value: 'scanningSequence',
        sortable: false
      },
      {
        text: 'Sequence Variant',
        value: 'sequenceVariant',
        sortable: false
      },
      {
        text: 'Echo Time',
        value: 'echoTime',
        sortable: true
      },
      {
        text: 'Inversion Time',
        value: 'inversionTime',
        sortable: true
      },
      {
        text: 'Repetition Time',
        value: 'repetitionTime',
        sortable: true
      },
      {
        text: 'Scan Instance',
        value: 'scanInstance',
        sortable: false
      }
    ],
    options: {
      itemsPerPage: 25,
      page: 1,
      sortBy: ['id'],
      descending: false
    },
    itemsPerPageOptions: [10, 25, 50, -1],
    loading: false
  }),
  computed: {
    ...mapState('dicom', ['seriesList', 'seriesCount']),
    ...mapState('mri', ['sequenceTypes']),
    ...mapGetters('mri', ['getDicomSeriesSequenceType', 'getScanByDicomSeries'])
  },
  methods: {
    getSequenceTypeTitle(series) {
      let type = this.getDicomSeriesSequenceType(series)
      return type ? type.title : 'Undefined'
    },
    getSpatialResolution(series) {
      let spatialResolution = series.pixelSpacing.concat(series.sliceThickness)
      return formatSpatialResolution(spatialResolution)
    },
    stringifyGroup(group) {
      return `${group.study.title} | ${group.title}`
    }
  }
}
</script>

<style scoped></style>
