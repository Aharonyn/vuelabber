<template>
  <v-col>
    <v-form @submit.prevent="submit">
      <v-text-field label="Username" v-model="user.username" disabled />
      <v-text-field label="Institute" v-model="user.profile['institute']" />
      <v-select
        label="Title"
        v-model="title"
        :items="Object.values(titlesDictionary)"
      />
      <v-text-field label="First Name" v-model="user.firstName" />
      <v-text-field label="Last Name" v-model="user.lastName" />
      <v-menu v-model="dateOfBirthMenu" :close-on-content-click="false">
        <template v-slot:activator="{ on }">
          <v-text-field
            label="Date of Birth"
            prepend-icon="cake"
            v-model="dateOfBirth"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="user.profile['dateOfBirth']"
          @input="dateOfBirthMenu = false"
        ></v-date-picker>
      </v-menu>
      <v-textarea
        hint="A short summary of who you are and what you're up to."
        label="Bio"
        v-model="user.profile['bio']"
      />
    </v-form>
    <v-row>
      <v-spacer />
      <v-btn class="mr-3" color="success" width="90px" @click="save"
        >Save</v-btn
      >
      <v-btn color="error" width="90px" @click="cancel">Cancel</v-btn>
    </v-row>
  </v-col>
</template>

<script>
import { getKeyByValue, titlesDictionary } from '@/utils'
import { mapActions } from 'vuex'

export default {
  name: 'EditUserInformation',
  props: { userInformation: Object },
  created() {
    this.user = Object.assign({}, this.userInformation)
    // Until image upload is fixed...
    delete this.user.profile['image']
  },
  data: () => ({
    titlesDictionary,
    dateOfBirthMenu: false,
    user: {}
  }),
  computed: {
    title: {
      get: function() {
        return this.titlesDictionary[this.user.profile['title']]
      },
      set: function(selectedTitle) {
        this.user.profile['title'] = getKeyByValue(
          this.titlesDictionary,
          selectedTitle
        )
      }
    },
    dateOfBirth: {
      get: function() {
        return this.$options.filters.formatDate(
          this.user.profile['dateOfBirth']
        )
      },
      set: function(newValue) {
        this.user.formatDate = newValue
      }
    }
  },
  methods: {
    save: function() {
      this.updateUser(this.user).then(() => this.$emit('finished-edit'))
    },
    cancel: function() {
      this.user = Object.assign({}, this.userInformation)
      this.$emit('finished-edit')
    },
    ...mapActions('accounts', ['updateUser'])
  }
}
</script>

<style lang="scss" scoped></style>
