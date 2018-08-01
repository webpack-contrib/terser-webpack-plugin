var Person = {
  firstName: null, // the person’s first name
  lastName: null // the person’s last name
};

// “subclass” Person
var Employee = Object.create(Person, {
  id: { // the employees’s id
    value: null,
    enumerable: true,
    configurable: true,
    writable: true
  }
});

// “subclass” Employee
var Manager = Object.create(Employee, {
  department: { // the manager’s department
    value: null,
    enumerable: true,
    configurable: true,
    writable: true
  }
});

module.exports = {
  Person: Person,
  Employee: Employee,
  Manager: Manager
};
