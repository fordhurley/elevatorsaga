{
    init: function(elevators, floors) {
        var requests = [];

        function requestOnce(floorNum) {
            if (requests.indexOf(floorNum) == -1) {
                requests.push(floorNum);
            }
        }

        function clearRequest(floorNum) {
            var index = requests.indexOf(floorNum);
            if (index >= 0) {
                requests.splice(index, 1);
            }
        }

        var elevatorChoice = 0;

        function updateElevatorQueues(elevator) {
            console.log(requests);
            if (requests.length) {
                var floorNum = requests[0];
                if (elevator !== undefined) {
                    elevator = elevator;
                } else {
                    elevator = elevators[elevatorChoice];
                    elevatorChoice += 1;
                    if (elevatorChoice >= elevators.length) {
                        elevatorChoice = 0;
                    }
                }
                elevator.goToFloor(floorNum);
            }
        }

        elevators.forEach(function(elevator) {
            elevator.on("idle", function() {
                updateElevatorQueues(elevator);
            });
            elevator.on("passing_floor", function(floorNum, direction) {
                if (requests.indexOf(floorNum) != -1) {
                    elevator.goToFloor(floorNum, true); // go immediately
                }
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                clearRequest(floorNum);
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                requestOnce(floorNum);
                updateElevatorQueues();
            });
        });

        floors.forEach(function(floor) {
            floor.on("up_button_pressed", function() {
                requestOnce(floor.floorNum());
                updateElevatorQueues();
            });
            floor.on("down_button_pressed", function() {
                requestOnce(floor.floorNum());
                updateElevatorQueues();
            });
        });
    },

    update: function(dt, elevators, floors) {}
}
