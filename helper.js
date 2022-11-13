import { ObjectId } from "mongodb";
import {client} from "./index.js";

// -----------GET ALL-----------
export async function getAll(){
    return await client.db("sm_database").collection("users").find({}).toArray();
};

// -----------Mentor-----------
export async function createMentor(data){
    return await client.db("sm_database").collection("users").insertOne(data);
};

export async function getMentors(query){
    const data = {...query, type: "mentor"}
    return await client.db("sm_database").collection("users").find(data).toArray();
};

export async function getMentorOne(_id){
    const id = ObjectId(_id);
    return await client.db("sm_database").collection("users").findOne({ _id: id, type: "mentor" });
};

export async function updateMentor(_id, mentees){
    const id = ObjectId(_id);
    return await client.db("sm_database").collection("users").updateOne({ _id: id, type: "mentor" }, {$push:{ mentees:{$each: mentees}}});
};

export async function updatePrevMentor(mID, sObj){
    const mentorID = ObjectId(mID);
    return await client.db("sm_database").collection("users").updateOne({ _id: mentorID, type: "mentor" }, {$pull: {mentees: sObj } });
}

// -----------Student-----------
export async function createStudent(data){
    return await client.db("sm_database").collection("users").insertOne(data);
};

export async function getStudents(){
    return await client.db("sm_database").collection("users").find({type: "student"}).toArray();
};

export async function getStudentOne(_id){
    const id = ObjectId(_id);
    return await client.db("sm_database").collection("users").findOne({ _id: id, type: "student"});
};

export async function getStudentsNoMentor(){
    return await client.db("sm_database").collection("users").find({type: "student", mentor: null}).toArray();
};

export async function updateStudent(_id, mentor){
    const id = ObjectId(_id);
    const data = {mentor: mentor};
    return await client.db("sm_database").collection("users").updateOne({ _id: id, type: "student" }, {$set: data});
};

export async function updateStudentsMany(id, mentor){
    const arrayObjIDs = id.map(item => ObjectId(item));
    const data = {mentor: mentor}
    return await client.db("sm_database").collection("users").updateMany({ _id: {$in: arrayObjIDs}, type: "student" }, {$set: data});
};




