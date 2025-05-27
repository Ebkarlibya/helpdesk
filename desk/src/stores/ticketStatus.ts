import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { StatusEnum } from "@/utils";

export const useTicketStatusStore = defineStore("ticketStatus", () => {

  const options = ref(
    [
      "New",
      "Under Review",
      "Awaiting Customer Info",
      "Customer Responded",
      "Work in Progress",
      "Non-SLA – Transferred for Evaluation",
      "Transferred to Project Tracker",
      "Resolved",
      "Closed",
      "Cancelled"
    ]
  );


  const dropdown = computed(() =>
    options.value.map((o) => ({
      label: o,
      value: o,
    }))
  );

  const detailedDropdown = computed(() =>
    options.value.map((o) => ({
      label: o,
      value: o,
    }))
  );

  const colorMap = {
    "New": "red",
    "Under Review": "red",
    "Awaiting Customer Info": "blue",
    "Customer Responded": "red",
    "Work in Progress": "red",
    "Non-SLA – Transferred for Evaluation": "yellow",
    "Transferred to Project Tracker": "green",
    "Resolved": "green",
    "Closed": "gray",
    "Cancelled": "gray",
  };


  const textColorMap = {
    "New": "!text-red-600",
    "Under Review": "!text-red-600",
    "Awaiting Customer Info": "!text-blue-600",
    "Customer Responded": "!text-red-600",
    "Work in Progress": "!text-red-600",
    "Non-SLA – Transferred for Evaluation": "!text-yellow-600",
    "Transferred to Project Tracker": "!text-green-700",
    "Resolved": "!text-green-700",
    "Closed": "!text-gray-700",
    "Cancelled": "!text-gray-700",
  };

  const stateActive = [StatusEnum.new, StatusEnum.awaitingCustomerInfo];
  const stateInactive = [StatusEnum.resolved, StatusEnum.closed, StatusEnum.cancelled];



  return {
    colorMap,
    dropdown,
    detailedDropdown,
    options,
    stateActive,
    stateInactive,
    textColorMap
  };
});
