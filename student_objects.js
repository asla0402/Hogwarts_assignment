"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

let halfBlood = [];

let fullBlood = [];

let singleview;

let article;

let searchBar;

let crestImage;

let bloodList;

let prefectA;

let prefectB;

//let hasBeenHacked = false;

const studentsJsonLink = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodJsonLink = "https://petlatkea.dk/2021/hogwarts/families.json";

// The prototype for all students:
const Student = {
  first_name: "",
  nick_name: "",
  middle_name: "",
  last_name: "",
  second_name: "",
  full_name: "",
  gender: "",
  house: "",
  image: "",
  blood: "",
  expelled: false,
  inquisitorial: false,
  prefect: false
};

const settings = {
  filterBy: "all",
  sortBy: "first_name",
  sortDir: "asc"
};

function start() {
  singleview = document.querySelector("#singleview");
  searchBar = document.querySelector("#searchBar");
  article = document.querySelector("article");
  crestImage = document.querySelector("#crestImage");
  searchBar.addEventListener("input", updateAfterChange);
  registerButtons();
  loadJsonData();
}

function registerButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
}

async function loadJsonData() {
  const responseStudents = await fetch(studentsJsonLink);
  const responseBloodlist = await fetch(bloodJsonLink);

  const jsonDataStudents = await responseStudents.json();
  const jsonDataBloodstatus = await responseBloodlist.json();

  // when loaded, prepare data objects
  prepareBloodstatusObjects(jsonDataBloodstatus);
  prepareStudentObjects(jsonDataStudents);
}

function prepareBloodstatusObjects(jsonData) {
  halfBlood = jsonData.half;
  fullBlood = jsonData.pure;
}

function prepareStudentObjects(jsonData) {
  allStudents = jsonData.map(prepareStudentsObject);
  updateAfterChange();
}

function prepareStudentsObject(jsonObject) {
  const student = Object.create(Student);

  let fullname = jsonObject.fullname.trim();
  let house = jsonObject.house.trim();
  let gender = jsonObject.gender.trim();

  let names = fullname.split(" ");

  //find out middlename and nickname
  if (names.length > 2) {
    let second_name = names[1];
    if (second_name.includes('"')) {
      student.nick_name = second_name.replaceAll('"', "");
    } else {
      student.middle_name = capitalize(second_name);
    }
  }
  student.first_name = capitalize(names[0]);
  student.last_name = capitalizeName(names[names.length - 1]);
  student.full_name = student.first_name + " " + student.nick_name + " " + student.middle_name + " " + student.last_name;
  student.gender = capitalize(gender);
  student.house = capitalize(house);
  let imageName = "imagesi/" + student.last_name + "_" + student.first_name[0] + ".png";
  if (student.last_name === "Patil") {
    if (student.first_name === "Padma") {
      imageName = "imagesi/patil_padma.png";
    } else {
      imageName = "imagesi/patil_parvati.png";
    }
  }

  student.image_name = imageName;

  //find out bloodstatus
  if (halfBlood.includes(student.last_name)) {
    student.blood = "Half-Blood";
  } else if (fullBlood.includes(student.last_name)) {
    student.blood = "Pure-Blood";
  } else {
    student.blood = "Muggle";
  }

  return student;
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  //filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  updateAfterChange();
}

function filterList(filteredList) {
  //let filteredList = allStudents;

  if (settings.filterBy === "gryffindor") {
    //create a filtered list of only gryffindor
    filteredList = allStudents.filter(isGryffindor);
  } else if (settings.filterBy === "slytherin") {
    //create a filtered list of only slytherin
    filteredList = allStudents.filter(isSlytherin);
  } else if (settings.filterBy === "ravenclaw") {
    //create a filtered list of only ravenclaw
    filteredList = allStudents.filter(isRavenclaw);
  } else if (settings.filterBy === "hufflepuff") {
    //create a filtered list of only hufflepuff
    filteredList = allStudents.filter(isHufflepuff);
  } else if (settings.filterBy === "expelled") {
    //create a filtered list of only hufflepuff
    filteredList = allStudents.filter(isExpelled);
  } else {
    // filter === "all"
    filteredList = allStudents.filter(isNotExpelled);
  }

  filteredList = filteredList.filter(isInSearch);

  return filteredList;
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find old sortBy element and remove .sortBy
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");

  //indicate active sort
  event.target.classList.add("sortby");

  //toggle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  updateAfterChange();
}

function sortList(sortedList) {
  //let sortedList = allStudents;
  let direction = 1;

  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    settings.direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

function updateAfterChange() {
  let currentList = filterList(allStudents);
  currentList = sortList(currentList);

  buildInfo(currentList);

  displayList(currentList);
}

function displayList(students) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=first_name]").textContent = student.first_name;
  clone.querySelector("[data-field=nick_name]").textContent = student.nick_name;
  clone.querySelector("[data-field=middle_name]").textContent = student.middle_name;
  clone.querySelector("[data-field=last_name]").textContent = student.last_name;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=expelled]").textContent = student.expelled;
  clone.querySelector("[data-field=prefect]").textContent = student.prefect;
  clone.querySelector("[data-field=bloodstatus]").textContent = student.blood;
  //clone.querySelector("[data-field=inquisitorial]").textContent = student.inquisitorial;

  //PREFECT
  clone.querySelector("[data-field=prefect]").addEventListener("click", () => clickPrefect(student));
  if (student.prefect === false) {
    clone.querySelector("[data-field=prefect]").textContent = "Make student prefect";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "Prefect";
  }

  //EXPELLED
  clone.querySelector("[data-field=expelled]").addEventListener("click", () => clickExpelled(student));
  if (student.expelled === false) {
    clone.querySelector("[data-field=expelled]").textContent = "Expel student";
  } else {
    clone.querySelector("[data-field=expelled]").textContent = "Expelled";
  }

  //INQUISITORIAL SQUAD
  clone.querySelector("[data-field=inquisitorial]").addEventListener("click", () => clickInquisitorial(student));
  console.log(student.inquisitorial);
  if (student.inquisitorial === false) {
    clone.querySelector("[data-field=inquisitorial]").textContent = "Join the Inquisitorial Squad";
  } else {
    clone.querySelector("[data-field=inquisitorial]").textContent = "Member of the Inquisitorial Squad";
  }

  //singleview
  clone.querySelector("button").addEventListener("click", () => showSingleview(student));
  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

function buildInfo(currentList) {
  let studentCountAll = allStudents.length;
  let currentlyShown = currentList.length;
  let expelledCount = allStudents.filter(isExpelled).length;
  let notExpelledCount = allStudents.filter(isNotExpelled).length;

  let houseGryffindor = allStudents.filter(isGryffindor).length;
  let houseSlytherin = allStudents.filter(isSlytherin).length;
  let houseRavenclaw = allStudents.filter(isRavenclaw).length;
  let houseHufflepuff = allStudents.filter(isHufflepuff).length;

  document.querySelector("#studentCountAll").textContent = "All students: " + studentCountAll;
  document.querySelector("#currentlyShown").textContent = "Currently shown: " + currentlyShown;
  document.querySelector("#expelledCount").textContent = "Expelled students: " + expelledCount;
  document.querySelector("#notExpelledCount").textContent = "Students that aren't expelled: " + notExpelledCount;

  document.querySelector("#houseNumberGryffindor").textContent = "Students in Gryffindor: " + houseGryffindor;
  document.querySelector("#houseNumberSlytherin").textContent = "Students in Slytherin: " + houseSlytherin;
  document.querySelector("#houseNumberRavenclaw").textContent = "Students in Ravenclaw: " + houseRavenclaw;
  document.querySelector("#houseNumberHufflepuff").textContent = "Students in Hufflepuff: " + houseHufflepuff;
}

function clickPrefect(student) {
  //værdien bliver skiftet: true bliver til false, false bliver til true

  if (student.prefect === true) {
    student.prefect = false;
  } else {
    makeAStudentPrefect(student);
  }
  updateAfterChange();
}

function makeAStudentPrefect(selectedStudent) {
  let prefects = allStudents.filter((student) => student.prefect && student.house === selectedStudent.house);
  let numberOfPrefects = prefects.length;

  let prefectA;
  let prefectB;

  if (numberOfPrefects >= 2) {
    prefectA = prefects[0];
    prefectB = prefects[1];
    singleviewPrefectRemove();
  } else {
    makePrefect(selectedStudent);
  }

  function singleviewPrefectRemove() {
    // ask the user to ignore, or remove 'other'
    document.querySelector("#remove_prefect").classList.remove("hidden");
    document.querySelector("#remove_prefect .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_prefect #removeA").addEventListener("click", clickRemovePrefectA);
    document.querySelector("#remove_prefect #removeB").addEventListener("click", clickRemovePrefectB);

    // show names on removebottons
    document.querySelector("#remove_prefect [data-field=prefectA]").textContent = prefectA.first_name;
    document.querySelector("#remove_prefect [data-field=prefectB]").textContent = prefectB.first_name;

    // if ignore - do nothing..
    function closeDialog() {
      document.querySelector("#remove_prefect").classList.add("hidden");
      document.querySelector("#remove_prefect .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_prefect .removeA").removeEventListener("click", clickRemovePrefectA);
      document.querySelector("#remove_prefect .removeB").removeEventListener("click", clickRemovePrefectB);
    }
  }

  // if remove other:
  function clickRemovePrefectA() {
    removePrefect(prefectA);
    makePrefect(selectedStudent);
    updateAfterChange();
    document.querySelector("#remove_prefect").classList.add("hidden");
  }

  function clickRemovePrefectB() {
    removePrefect(prefectB);
    makePrefect(selectedStudent);
    updateAfterChange();
    document.querySelector("#remove_prefect").classList.add("hidden");
  }

  function removePrefect(prefectStudent) {
    prefectStudent.prefect = false;
  }

  function makePrefect(student) {
    student.prefect = true;
  }
}

function clickExpelled(student) {
  student.expelled = true;
  updateAfterChange();
}

function clickInquisitorial(student) {
  console.log(student);
  if (student.blood === "Pure-Blood") {
    student.inquisitorial = !student.inquisitorial;
    updateAfterChange();
  }
}

function showSingleview(student) {
  //if-statement to display the correct house theme/color for each house i singleview

  singleview.style.display = "block";
  if (isGryffindor(student)) {
    article.style.backgroundColor = "#740001";
    crestImage = "imagesi/gryffindor_crest.png";
  } else if (isSlytherin(student)) {
    article.style.backgroundColor = "#2a623d";
    crestImage = "imagesi/slytherin_crest.png";
  } else if (isRavenclaw(student)) {
    article.style.backgroundColor = "#222f5b";
    crestImage = "imagesi/ravenclaw_crest.png";
  } else if (isHufflepuff(student)) {
    article.style.backgroundColor = "#ecb939";
    crestImage = "imagesi/hufflepuffe_crest.png";
  }

  singleview.querySelector("#singleviewImage").src = student.image_name.toLowerCase();
  singleview.querySelector("#singleviewName").textContent = "Name: " + student.full_name;
  singleview.querySelector("#singleviewGender").textContent = "Gender: " + student.gender;
  singleview.querySelector("#singleviewHouse").textContent = "House: " + student.house;
  singleview.querySelector("#crestImage").src = crestImage;
  singleview.querySelector("#studentExpelled").textContent = student.expelled ? "Status: " + "Expelled" : "";
  singleview.querySelector("#studentPrefect").textContent = student.prefect ? "Prefect" : "";
  singleview.querySelector("#singleviewBloodstatus").textContent = "Bloodstatus: " + student.blood;
  //singleview.querySelector("#singkeviewInquisitorial").textContent = student.inquisitorial;

  document.querySelector("#close").addEventListener("click", closeSingleview);
}

function closeSingleview() {
  singleview.style.display = "none";
}
/*function hackTheSystem() {
  if(!hasBeenHacked) {
    hasBeenHacked = true;
  }
}*/

// all functions downwards is side-funtions to the program

function isGryffindor(student) {
  return student.house === "Gryffindor";
}

function isSlytherin(student) {
  return student.house === "Slytherin";
}

function isRavenclaw(student) {
  return student.house === "Ravenclaw";
}

function isHufflepuff(student) {
  return student.house === "Hufflepuff";
}

function isExpelled(student) {
  return student.expelled;
}

function isNotExpelled(student) {
  return !student.expelled;
}

function isPrefect(student) {
  return !student.prefect;
}

function isNotPrefect(student) {
  return !student.prefect;
}

function isInSearch(student) {
  return student.full_name.toLowerCase().includes(searchBar.value.toLowerCase());
}

// functions to handle names
function capitalize(str) {
  const result = str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  return result;
}

function capitalizeName(name) {
  if (name.includes("-")) {
    let names = name.split("-");
    return capitalize(names[0]) + "-" + capitalize(names[1]);
  } else {
    return capitalize(name);
  }
}

function findMiddleName(names) {
  if (names.length > 2) {
    return names[1];
  } else {
    return "";
  }
}
