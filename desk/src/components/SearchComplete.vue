<template>
  <Autocomplete
    placeholder="Select an option"
    :options="options"
    :value="selection"
    @update:query="(q) => onUpdateQuery(q)"
    @change="
      (v) => {
        if (!resetInput) {
          selection = v;
        }
        emit('change', v);
      }
    "
  />
</template>

<script setup lang="ts">
import { Autocomplete } from "@/components";
import { createResource } from "frappe-ui";
import { computed, ref } from "vue";

const emit = defineEmits(["change"]);

const props = defineProps({
  value: {
    type: String,
    required: false,
    default: "",
  },
  doctype: {
    type: String,
    required: true,
  },
  searchField: {
    type: String,
    required: false,
    default: "name",
  },
  labelField: {
    type: String,
    required: false,
    default: "name",
  },
  valueField: {
    type: String,
    required: false,
    default: "name",
  },
  pageLength: {
    type: Number,
    required: false,
    default: 100,
  },
  resetInput: {
    type: Boolean,
    required: false,
    default: false,
  },
  customFilters: {
    type: Object,
    required: false,
    default: {},
  },
});

const r = createResource({
  url: "helpdesk.api.doc.get_hd_agents",
  pageLength: props.pageLength,
  auto: true,
  fields: [props.labelField, props.searchField, props.valueField],
  filters: {
    [props.searchField]: ["like", `%${props.value}%`],
    ...props.customFilters,
  },
  onSuccess: () => {
    selection.value = props.value
      ? options.value.find((o) => o.value === props.value)
      : null;
  },
});
const options = computed(
  () =>
    r.data?.map((result) => ({
      label: result[props.labelField],
      value: result[props.valueField],
    })) || []
);
const selection = ref(null);

function onUpdateQuery(query: string) {
  r.update({
    filters: {
      [props.searchField]: ["like", `%${query}%`],
      ...props.customFilters,
    },
  });

  r.reload();
}
</script>
