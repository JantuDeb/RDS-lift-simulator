class Lift {
    constructor(id) {
        this.id = id;
        this.currentFloor = 0;
        this.status = 'idle'; //idle, moving_up, moving_down
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

    setStatus(status) {
        this.status = status;
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
            let buttonsHtml = `<p>Floor ${i}</p><div class="buttons">`;
            if (i < numFloors - 1) {
                buttonsHtml += `<button onclick="liftController.callLift(${i}, 'moving_up')">Up</button>`;
            }
            if (i > 0) {
                buttonsHtml += `<button onclick="liftController.callLift(${i}, 'moving_down')">Down</button>`;
            }
            buttonsHtml += `</div>`;

            floorDiv.innerHTML = buttonsHtml;
            this.building.appendChild(floorDiv);
            this.floors.push(floorDiv);
        }
    }

    callLift(targetFloor, direction) {
        const availableLift = this.findNearestAvailableLift(targetFloor, direction);
        if (availableLift) {
            this.moveLift(availableLift, targetFloor);
        } else {
            const alreadyInQueue = this.requestQueue.some(
                request => request.targetFloor === targetFloor && request.direction === direction
            );

            if (!alreadyInQueue) {
                this.requestQueue.push({ targetFloor, direction });
            }
        }
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

    moveLift(lift, targetFloor) {
        const status = targetFloor > lift.currentFloor ? "moving_up" : "moving_down";
        lift.setStatus(status);
        const timeToReach = Math.abs(targetFloor - lift.currentFloor) * 2000;
        this.updateLiftPositions(lift, targetFloor, timeToReach);
        setTimeout(() => {
            lift.updateFloor(targetFloor);
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
                lift.setStatus("idle");
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
    const floorCount = parseInt(document.getElementById('floors').value);
    const liftCount = parseInt(document.getElementById('lifts').value);
    liftController = new LiftController(liftCount, floorCount);
}

let liftController;

initBuilding();



