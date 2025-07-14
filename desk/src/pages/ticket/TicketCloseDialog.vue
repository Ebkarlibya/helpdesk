<template>
  <Dialog :model-value="open" :options="{
    title: 'Close Ticket',
    actions: [
      {
        disabled: !reason_of_closing,
        label: 'Clsoe',
        theme: 'gray',
        variant: 'solid',
        onClick: () =>
          setValue.submit({
            fieldname: {
              status: StatusEnum.closed,
              reason_of_closing: reason_of_closing
            },
          }),
      },
            {
        label: 'Done',
        theme: 'gray',
        variant: 'solid',
        onClick: () => {
          open = false
        }
      },
    ],
  }" @update:model-value="() => $emit('update:open', !open)">
    <template #body-content>
      <div class="space-y-4 text-base text-gray-700">
        <div v-if="options.data?.length" class="space-y-2">
          <span> Reason of Closing </span>
          <span class="text-red-500"> * </span>
          <div class="flex flex-wrap gap-2">
            <Button v-for="o in options.data" :key="o.name" :label="o.name" :theme="reason_of_closing === o.name ? 'blue' : 'gray'"
              variant="subtle" @click="reason_of_closing = o.name" />
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch, getCurrentInstance } from "vue";
import { createResource, createListResource } from "frappe-ui";
import { StarRating } from "@/components";
import { ITicket } from "./symbols";
import { StatusEnum } from "@/utils";
import { Resource, Ticket } from "@/types";

const app = getCurrentInstance()
const { $emitter } = app.appContext.config.globalProperties



// interface P {
//   open: boolean;
// }

interface E {
  (event: "update:open", open: boolean): void;
}


// const emit = defineEmits<E>();
const open = ref(false)
const ticket = ref<Resource<Ticket>>(null);
const reason_of_closing  = ref(null);


const options = createListResource({
  doctype: "HD Reason of Ticket Close",
  fields: ["name"],
  pageLength: 99999,
});

const setValue = createResource({
  url: "frappe.client.set_value",
  debounce: 300,
  makeParams: (params) => {
    return {
      doctype: "HD Ticket",
      name: ticket.value.data.name,
      fieldname: params.fieldname,
      value: params.value,
    };
  },
  onSuccess: () => {
    // emit("update:open", false);
    open.value = false
    ticket.value.reload();
  },
});


onMounted(() => {
  $emitter.on("od_ticket_close", (_ticket: Resource<Ticket>) => {
    ticket.value = _ticket
    options.fetch()
    open.value = true
  })

});
</script>
