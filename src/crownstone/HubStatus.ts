// @ts-ignore
export let HubStatus : HubStatus = {}
resetHubStatus();

export function resetHubStatus() {
  HubStatus = {
    initialized: false,
    loggedIntoCloud: false,
    loggedIntoSSE: false,
    syncedWithCloud: false,
    uartReady: false,
    belongsToSphere: 'none',
  }
}