<template>
  <div class="flex w-[382px] flex-col justify-between border-l">
    <div class="flex h-10.5 items-center border-b px-5 py-2.5 text-lg font-medium text-ink-gray-9 justify-between">
      <div>
        <Tooltip :text="ticket.status">
          <span class="cursor-copy text-lg font-semibold me-3" @click="copyToClipboard(ticket.name, ticket.name)">#{{
            ticket.name }}
          </span>
        </Tooltip>
        <!-- <Badge
          v-if="ticket.status"
          :class="detailedTextColorMap[ticket.status]"
          :label="ticket.status"
          variant="subtle"
          theme="red"
        /> -->
      </div>

      <Dropdown v-if="showMergeOption" :options="[
        {
          label: 'Merge Ticket',
          onClick: () => (showMergeModal = true),
          icon: LucideMerge,
          condition: () => !ticket.is_merged,
        }
      ]">
        <Button icon="more-horizontal" class="text-gray-600" variant="ghost" />
      </Dropdown>
    </div>
    <TicketAgentContact :contact="ticket.contact" @email:open="(e) => emit('email:open', e)" />
    <!-- feedback component -->
    <TicketFeedback v-if="ticket.feedback_rating" class="py-3 !px-6 !gap-3 text-base text-gray-600" :ticket="ticket" />
    <!-- ticket details -->
    <TicketAgentDetails :ticket="ticket" />
    <!-- fields -->
    <TicketAgentFields :ticket="ticket" @update="update" />
    <TicketMergeModal :ticket="ticket" v-if="showMergeModal" v-model="showMergeModal" @update="emit('reload')" />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from "vue";
import { useTicketStatusStore } from "@/stores/ticketStatus";
import TicketAgentDetails from "./TicketAgentDetails.vue";
import TicketAgentContact from "./TicketAgentContact.vue";
import TicketAgentFields from "./TicketAgentFields.vue";
import TicketMergeModal from "./TicketMergeModal.vue";
import LucideMerge from "~icons/lucide/merge";
import Restore from '../icons/Delete.vue'


import { copyToClipboard } from "@/utils";
import { Ticket } from "@/types";
import { computed } from "vue";
import { call } from "frappe-ui"
const { textColorMap, detailedTextColorMap } = useTicketStatusStore();

interface Props {
  ticket: Ticket;
}

const props = defineProps<Props>();

const emit = defineEmits(["update", "email:open", "reload"]);

function update(val = null) {
  if (val.value && typeof val.value === "object") {
    val.value = val.value.target?.value || null;
  }
  emit("update", val);
}

const showMergeModal = ref(false);

const showMergeOption = computed(() => {
  // hd plus (need check) show merge
  return false; 
  //(!props.ticket.is_merged && ["Open", "Replied"].includes(props.ticket.status));
});
</script>
