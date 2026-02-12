export const state = {
    currentUser: null,
    userToken: null,
    data: [],
    filteredData: [],
    isFilterActive: false,
    selectedDispositions: [],
    availableDispositions: [],
    currentIndex: 0,
    historyLog: [],
    sessionDispositions: {},
    lastSavedIndex: -1,

    // Method to reset critical session state
    reset() {
        this.currentUser = null;
        this.userToken = null;
        this.data = [];
        this.filteredData = [];
        this.currentIndex = 0;
    }
};
