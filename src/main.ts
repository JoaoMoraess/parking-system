import "./style.css";

type DomElements = {
  nameInput: HTMLInputElement;
  plateInput: HTMLInputElement;
  registerButton: HTMLButtonElement;
  table: HTMLTableElement;
  error: HTMLParagraphElement;
};
type CarInfo = { name: string; plate: string; entryTime?: string };

function loadDomElements(document: Document): DomElements {
  const elements = {
    nameInput: document.getElementById("carName") as HTMLInputElement,
    plateInput: document.getElementById("carPlate") as HTMLInputElement,
    registerButton: document.getElementById("register") as HTMLButtonElement,
    table: document.getElementById("carsTable") as HTMLTableElement,
    error: document.getElementById("error") as HTMLParagraphElement,
  };
  return elements;
}

function loadInputsValue(inputs: DomElements): CarInfo {
  const values = {
    name: inputs.nameInput.value,
    plate: inputs.plateInput.value,
  };
  return values;
}

const domElements = loadDomElements(document);

const localStorageRepository = {
  update() {
    updateTable(domElements.table);
  },
  set(key: string, data: object) {
    window.localStorage.setItem(key, JSON.stringify(data));
    this.update();
  },
  remove(key: string, identifier: string) {
    const storagedCars: { [plate: string]: CarInfo } = JSON.parse(
      window.localStorage.getItem(key)!
    );

    const newCars: { [plate: string]: CarInfo } = {};
    Object.keys(storagedCars).forEach((key) => {
      if (key !== identifier) {
        newCars[key] = storagedCars[key];
      }
    });
    window.localStorage.setItem(key, JSON.stringify(newCars));
    this.update();
  },
};

function registerCar(carInfo: CarInfo, window: Window): void {
  if (carInfo.name.length < 1 || carInfo.plate.length < 1) {
    domElements.error.innerHTML = "Preencha os campos!";
    return;
  } else {
    domElements.error.innerHTML = "";
  }

  const date = new Date();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const storagedCars = JSON.parse(window.localStorage.getItem("cars")!);
  const cars = {
    [carInfo.plate]: {
      entryTime: `${hour}:${minutes}`,
      name: carInfo.name,
      plate: carInfo.plate,
    },
    ...storagedCars,
  };

  localStorageRepository.set("cars", cars);
}

function removeCar(plate: string) {
  localStorageRepository.remove("cars", plate);
}

function loadEntries(window: Window): { [plate: string]: CarInfo } {
  const cars = JSON.parse(window.localStorage.getItem("cars")!) as {
    [plate: string]: CarInfo;
  };

  return cars;
}

const createElementsFactory = (elName: string, value?: string): any => {
  const el = document.createElement(elName);
  value ? (el.innerHTML = value) : null;
  return el;
};

function updateTable(tableElement: HTMLTableElement) {
  const storagedCars = loadEntries(window);
  tableElement.innerHTML = "";
  Object.keys(storagedCars).forEach((key) => {
    const tableRow = createElementsFactory("tr") as HTMLTableRowElement;
    const nameData = createElementsFactory(
      "td",
      storagedCars[key].name
    ) as HTMLTableCellElement;

    const entryData = createElementsFactory(
      "td",
      storagedCars[key].entryTime
    ) as HTMLTableCellElement;

    const plateData = createElementsFactory(
      "td",
      storagedCars[key].plate
    ) as HTMLTableCellElement;

    const action = createElementsFactory("td") as HTMLButtonElement;
    const buttonRegistry = createElementsFactory("button", "x");
    buttonRegistry.onclick = () => removeCar(storagedCars[key].plate);

    tableRow.appendChild(nameData);
    tableRow.appendChild(plateData);
    tableRow.appendChild(entryData);
    action.appendChild(buttonRegistry);
    tableRow.appendChild(action);
    tableElement.appendChild(tableRow);
  });
}

updateTable(domElements.table);

domElements.registerButton.onclick = (_event: MouseEvent) =>
  registerCar(loadInputsValue(domElements), window);
