<template>
  <v-data-table
    item-key="id"
    :headers="headers"
    :hide-default-footer="true"
    :items="analysisVersions"
    :loading="loading"
  >
    <template v-slot:item.inputSpecification="{ item }">
      <a @click="goToInputSpecification(item.inputSpecification)">
        {{ item.inputSpecification }}
      </a>
    </template>

    <template v-slot:item.outputSpecification="{ item }">
      <a @click="goToOutputSpecification(item.outputSpecification)">
        {{ item.outputSpecification }}
      </a>
    </template>
  </v-data-table>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'AnalysisVersionTable',
  props: { analysis: Object },
  data: () => ({
    headers: [
      { text: 'Title', value: 'title', align: 'left', width: '5%' },
      { text: 'Description', value: 'description', align: 'left' },
      {
        text: 'Input Specification',
        value: 'inputSpecification',
        align: 'center',
        width: '15%'
      },
      {
        text: 'Output Specification',
        value: 'outputSpecification',
        align: 'center',
        width: '15%'
      }
    ],
    loading: false
  }),
  computed: {
    ...mapState('analysis', ['analysisVersions'])
  },
  methods: {
    goToInputSpecification: function(inputSpecificationId) {
      this.$emit('goToInputSpecification', inputSpecificationId)
    },
    goToOutputSpecification: function(outputSpecificationId) {
      this.$emit('goToOutputSpecification', outputSpecificationId)
    }
  }
}
</script>

<style lang="scss" scoped></style>
