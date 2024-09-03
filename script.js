const building = document.getElementById('controls');
building.addEventListener("submit", (e) => {
    console.log(e)
    e.preventDefault();
    initBuilding()
})
class Lift {
    constructor(id) {
        this.id = id;
        this.currentFloor = 0;
        this.targetFloor = null;
        this.status = 'idle'; //idle, moving_up, moving_down
        this.direction = null; //up, down
        this.element = this.createLiftElement();
    }

    createLiftElement() {
        const liftElement = document.createElement('div');
        liftElement.classList.add('lift');

        const doorLeft = document.createElement('div');
        doorLeft.classList.add('door', 'left-door');

        const doorRight = document.createElement('div');
        doorRight.classList.add('door', 'right-door');

        liftElement.appendChild(doorLeft);
        liftElement.appendChild(doorRight);

        return liftElement;
    }

    updateFloor(floor) {
        this.currentFloor = floor;
    }

    updateTargetFloor(floor) {
        this.targetFloor = floor;
    }

    setStatus(status) {
        if (status === "idle") {
            this.direction = null
        }
        this.status = status;
    }
    setDirection(direction) {
        this.direction = direction
    }
}

class LiftController {
    building = document.getElementById('building');

    constructor(numLifts, numFloors) {
        this.lifts = [];
        this.floors = [];
        this.requestQueue = [];
        this.building.replaceChildren()
        this.initFloors(numFloors);
        this.initLifts(numLifts);
        this.building.style.width = numLifts * 150 + 'px';
    }

    initLifts(numLifts) {
        for (let i = 0; i < numLifts; i++) {
            const lift = new Lift(i);
            this.lifts.push(lift);
            lift.element.style.left = i * 100 + 'px';
            this.building.appendChild(lift.element);
        }
    }

    initFloors(numFloors) {
        this.building.style.height = numFloors * 150 + 'px';

        for (let i = 0; i < numFloors; i++) {
            const floorDiv = document.createElement('div');
            floorDiv.classList.add('floor');
            floorDiv.dataset.floor = i;
            let buttonsHtml = `<div class="buttons"><p>Floor ${i}</p>`;
            if (i < numFloors - 1) {
                buttonsHtml += `<button onclick="liftController.callLift(${i}, 'up')">Up</button>`;
            }
            if (i > 0) {
                buttonsHtml += `<button onclick="liftController.callLift(${i}, 'down')">Down</button>`;
            }
            buttonsHtml += `</div>`;

            floorDiv.innerHTML = buttonsHtml;
            this.building.appendChild(floorDiv);
            this.floors.push(floorDiv);
        }
    }

    callLift(targetFloor, direction) {
        if (this.checkIfLiftMovingToTargetFloor(targetFloor, direction)) return
        const availableLift = this.findNearestAvailableLift(targetFloor, direction);
        if (availableLift) {
            this.moveLift(availableLift, targetFloor, direction);
        } else this.checkAndrequestQueues(targetFloor, direction)
    }

    checkAndrequestQueues(targetFloor, direction) {
        const alreadyInQueue = this.requestQueue.some(
            request => request.targetFloor === targetFloor && request.direction === direction
        );

        if (!alreadyInQueue) {
            this.requestQueue.push({ targetFloor, direction });
        }
    }
    checkIfLiftMovingToTargetFloor(targetFloor, direction) {
        const lift = this.lifts.find(lift => lift.targetFloor === targetFloor && lift.direction === direction)
        console.log(lift)
        return lift ? true : false
    }

    findNearestAvailableLift(targetFloor, direction) {
        let closestLift = null;
        let minDistance = Infinity;

        for (const lift of this.lifts) {
            if (lift.status === "idle") {
                const distance = Math.abs(lift.currentFloor - targetFloor);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestLift = lift;
                }
            }
        }
        return closestLift;
    }

    moveLift(lift, targetFloor, direction) {
        const status = targetFloor > lift.currentFloor ? "moving_up" : "moving_down";
        lift.status = status
        lift.targetFloor = targetFloor
        lift.direction = direction
        const timeToReach = Math.abs(targetFloor - lift.currentFloor) * 2000;
        this.updateLiftPositions(lift, targetFloor, timeToReach);
        setTimeout(() => {
            lift.currentFloor = targetFloor
            this.openAndCloseDoors(lift);
        }, timeToReach);
    }

    updateLiftPositions(lift, targetFloor, timeToReach) {
        lift.element.style.transitionDuration = `${timeToReach}ms`;
        lift.element.style.transitionTimingFunction = "linear";
        lift.element.style.transform = `translateY(-${targetFloor * 150}px)`;
    }

    openAndCloseDoors(lift) {
        const liftElement = lift.element;
        liftElement.classList.add('door-open');
        setTimeout(() => {
            liftElement.classList.remove('door-open');
            liftElement.classList.add('door-close');
            setTimeout(() => {
                liftElement.classList.remove('door-close');
                lift.status = "idle"
                lift.direction = null
                lift.targetFloor = null
                this.processQueue(); // Check and process the queue when a lift becomes idle
            }, 2500); // 2.5 seconds for the doors to fully close
        }, 2500); // 2.5 seconds for the doors to stay open
    }

    processQueue() {
        if (this.requestQueue.length > 0) {
            const { targetFloor, direction } = this.requestQueue.shift(); // Get the next request from the queue
            this.callLift(targetFloor, direction);
        }
    }
}
function initBuilding() {
    let floorCount = parseInt(document.getElementById('floors').value);
    if (floorCount < 1) {
        floorCount = 1;
        console.error("Floor count must be greater than 0");
    }
    let liftCount = parseInt(document.getElementById('lifts').value);
    if (liftCount < 1) {
        liftCount = 1;
        console.error("Lift count must be greater than 0");
    }
    liftController = new LiftController(liftCount, floorCount);
}

let liftController;

// initBuilding();



