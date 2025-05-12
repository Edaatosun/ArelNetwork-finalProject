// UserModel.js
export class User {
  constructor(id, tc,firstName, lastName, eMail, password,status, classNo, department, photo, resume) {
    this.id = id;
    this.tc = tc;
    this.firstName = firstName;
    this.lastName = lastName;
    this.eMail = eMail;
    this.password = password;
    this.status = status;
    this.classNo = classNo;
    this.department = department;
    this.photo = photo;
    this.resume = resume;
  }
}
