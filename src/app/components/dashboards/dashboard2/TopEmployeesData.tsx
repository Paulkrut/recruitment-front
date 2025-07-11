interface PerformerType {
  id: string;
  imgsrc: string;
  name: string;
  post: string;
  skill: string;
  rate: number;
  status: string;
}

const TopEmployeesData: PerformerType[] = [
  {
    id: "1",
    imgsrc: "/images/profile/user1.jpg",
    name: "Mark J. Freeman",
    post: "Developer",
    status: "Available",
    rate: 80,
    skill:"HTML"
  },
  {
    id: "2",
    imgsrc: "/images/profile/user2.jpg",
    name: "Nina R. Oldman",
    post: "Designer",
    status: "On Holiday",
    rate: 70,
    skill:"JavaScript"
  },
  {
    id: "3",
    imgsrc: "/images/profile/user3.jpg",
    name: "Arya H. Shah",
    post: "Developer",
    status: "Absent",
    rate: 40,
    skill:"React"
  },
  {
    id: "4",
    imgsrc: "/images/profile/user4.jpg",
    name: "June R. Smith",
    post: "Designer",
    status: "On Leave",
    rate: 20,
    skill:"Vuejs"
  },
  {
    id: "5",
    imgsrc: "/images/profile/user-6.jpg",
    name: "Deo K. Luis",
    post: "Developer",
    status: "Available",
    rate: 65,
    skill:"Angular"
  },
];

export default TopEmployeesData;
