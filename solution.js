{
    init: function(elevators, floors) {
        var pickupRequests = floors.map(function () { return false });

        function sortQueue(elevator) {
            elevator.destinationQueue.sort(function(a, b) {
                return Math.abs(a - elevator.currentFloor()) - Math.abs(b - elevator.currentFloor());
            });
            elevator.checkDestinationQueue();
        }

        elevators.forEach(function(elevator) {
            elevator.on("idle", function() {
                elevator.goToFloor(pickupRequests.indexOf(true));
            });
            elevator.on("passing_floor", function(floorNum, direction) {
                if ((pickupRequests[floorNum] && elevator.loadFactor() < 0.8) || elevator.destinationQueue.indexOf(floorNum) != -1) {
                    elevator.goToFloor(floorNum, true); // go immediately
                }
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                pickupRequests[floorNum] = false;
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.goToFloor(floorNum);
                sortQueue(elevator);
            });
        });

        floors.forEach(function(floor) {
            floor.on("up_button_pressed", function() {
                pickupRequests[floor.floorNum()] = true;
            });
            floor.on("down_button_pressed", function() {
                pickupRequests[floor.floorNum()] = true;
            });
        });
    },

    update: function(dt, elevators, floors) {}
}
