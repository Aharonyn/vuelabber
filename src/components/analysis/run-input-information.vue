<template>
  <v-data-table
    item-key="id"
    hide-default-footer
    :headers="headers"
    :items="inputs"
    :loading="loading"
  >
    <template v-slot:item.value="{ item }">
      <v-icon v-if="item.value == true" color="success">
        done
      </v-icon>
      <v-icon v-else-if="item.value == false" color="error">
        clear
      </v-icon>
      <div v-else>
        {{ item.value }}
      </div>
    </template>
  </v-data-table>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'RunInputInformation',
  props: { run: Object },
  data: () => ({
    headers: [
      { text: 'Key', value: 'key', width: 160 },
      { text: 'Value', value: 'value' }
    ],
    loading: false
  }),
  created() {
    this.loading = true
    let filters = { run: this.run.id }
    let pagination = {}
    let options = { filters: filters, pagination: pagination }
    this.fetchInputs(options).then(() => {
      this.loading = false
    })
  },
  computed: {
    ...mapState('analysis', ['inputs'])
  },
  methods: {
    ...mapActions('analysis', ['fetchInputs'])
  },
  watch: {
    run: function(selectedRun) {
      this.loading = true
      let filters = { run: selectedRun.id }
      let pagination = {}
      let options = { filters: filters, pagination: pagination }
      this.fetchInputs(options).then(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
