import express from "express";
import {
  createMentor,
  createStudent,
  getAll,
  getMentorOne,
  getMentors,
  getStudentOne,
  getStudents,
  getStudentsNoMentor,
  updateMentor,
  updatePrevMentor,
  updateStudent,
  updateStudentsMany,
} from "./helper.js";

const router = express.Router();

// ----------------GET ALL----------------
router.get("/", async function (request, response) {
  try {
    const result = await getAll();
    result.length
      ? response.status(200).send(result)
      : response
          .status(404)
          .send({ isSuccess: false, message: "No data found" });
  } catch (error) {
    response.status(400).send({ isSuccess: false, message: error.message });
  }
});

// ---------------Mentor------------------
router.post("/mentor", async function (request, response) {
  try {
    const { name } = request.body;
    if (name === undefined) {
      response
        .status(400)
        .send({ isInserted: false, message: `"Name" field is required` });
      return;
    }

    const mentor = {
      name: name,
      type: "mentor",
      mentees: [],
    };

    const result = await createMentor(mentor);
    result.acknowledged && result.insertedId !== ""
      ? response
          .status(200)
          .send({ isInserted: true, message: "Mentor created successfully" })
      : response.status(400).send({
          ...result,
          isInserted: false,
          message: "Failed to create a mentor",
        });
  } catch (error) {
    response.status(400).send({ isInserted: false, message: error.message });
  }
});

router.get("/mentor", async function (request, response) {
  try {
    const query = request.query;
    const result = await getMentors(query);
    result.length
      ? response.status(200).send(result)
      : response
          .status(404)
          .send({ isSuccess: false, message: "No data found" });
  } catch (error) {
    response.status(400).send({ isSuccess: false, message: error.message });
  }
});

router.get("/mentor/:_id", async function (request, response) {
  try {
    const { _id } = request.params;
    const result = await getMentorOne(_id);
    if (result) {
      const { name, mentees } = result;
      if (mentees.length) {
        const mentees_name = mentees.map((item) => item.name);
        response.status(200).send({ isSuccess: true, name, mentees_name });
      } else {
        response.status(200).send({
          isSuccess: true,
          name,
          mentees,
        });
        return;
      }
    } else {
      response.status(404).send({ isSuccess: false, message: "No data found" });
      return;
    }
  } catch (error) {
    response.status(400).send({ isSuccess: false, message: error.message });
  }
});

router.put("/mentor/:_id", async function (request, response) {
  try {
    const mentees = request.body;
    const { _id } = request.params;
    const result = await getMentorOne(_id);

    if (result) {
      if (mentees.length) {
        const putResult = await updateMentor(_id, mentees);

        if (putResult.matchedCount > 0 && putResult.modifiedCount > 0) {
          const arrayID = mentees.map((item) => item._id);
          const updateStudents = await updateStudentsMany(arrayID, {
            _id: _id,
            name: result.name,
          });
          if (
            updateStudents.modifiedCount === mentees.length &&
            updateStudents.matchedCount === mentees.length
          ) {
            response.status(200).send({
              isSuccess: true,
              message: "Mentees added to the Mentor",
            });
            return;
          } else {
            response.status(400).send({
              isSuccess: true,
              message:
                "Mentees added to the Mentor, but Mentor couldn't be added for some Mentees. Kindly check.",
            });
            return;
          }
        } else {
          response
            .status(400)
            .send({ isSuccess: false, message: "Failed to update Mentor" });
          return;
        }
      } else {
        response
          .status(400)
          .send({ isSuccess: false, message: "No mentees to be assigned" });
        return;
      }
    } else {
      response.status(404).send({ isSuccess: false, message: "No data found" });
      return;
    }
  } catch (error) {
    response.status(400).send({ isSuccess: false, message: error.message });
  }
});

// -----------------Student-------------------
router.post("/student", async function (request, response) {
  try {
    const { name } = request.body;
    if (name === undefined) {
      response
        .status(400)
        .send({ isInserted: false, message: `"Name" field is required` });
      return;
    }

    const student = {
      name: name,
      type: "student",
      mentor: null,
    };

    const result = await createStudent(student);
    result.acknowledged && result.insertedId !== ""
      ? response
          .status(200)
          .send({ isInserted: true, message: "Student created successfully" })
      : response.status(400).send({
          ...result,
          isInserted: false,
          message: "Failed to create a student",
        });
  } catch (error) {
    response.status(400).send({ isInserted: false, message: error.message });
  }
});

router.get("/student", async function (request, response) {
  try {
    const result = await getStudents();
    result.length
      ? response.status(200).send(result)
      : response
          .status(404)
          .send({ isSuccess: false, message: "No data found" });
  } catch (error) {
    response.status(400).send({ isSuccess: false, message: error.message });
  }
});

router.get("/student/:_id", async function (request, response) {
  try {
    const { _id } = request.params;
    const result = await getStudentOne(_id);
    result
      ? response.status(200).send(result)
      : response
          .status(404)
          .send({ isSuccess: false, message: "No data found" });
  } catch (error) {
    response.status(400).send({ isSuccess: false, message: error.message });
  }
});

router.get("/student-no-mentor", async function (request, response) {
  try {
    const result = await getStudentsNoMentor();
    result.length
      ? response.status(200).send(result)
      : response
          .status(404)
          .send({ isSuccess: false, message: "No data found" });
  } catch (error) {
    response.status(400).send({ isSuccess: false, message: error.message });
  }
});

router.put("/student/:_id", async function (request, response) {
  try {
    const mentor = request.body;
    const { _id } = request.params;
    const result = await getStudentOne(_id);
    if (result) {
      const prevMentor = result.mentor;
      if (mentor) {
        const putResult = await updateStudent(_id, mentor);

        if (putResult.matchedCount > 0 && putResult.modifiedCount > 0) {
          const mentee = [
            {
              _id: _id,
              name: result.name,
            },
          ];

          const updateMentorDetails = await updateMentor(mentor._id, mentee);
          if (
            updateMentorDetails.matchedCount > 0 &&
            updateMentorDetails.modifiedCount > 0
          ) {
            if (prevMentor !== null) {
              const updatePrevMentorDetails = await updatePrevMentor(
                prevMentor._id,
                { _id: _id, name: result.name }
              );
              if (
                updatePrevMentorDetails.matchedCount <= 0 ||
                updatePrevMentorDetails.modifiedCount <= 0
              ) {
                response.status(400).send({
                  isSuccess: true,
                  message:
                    "Student successfully updated with Mentor details but Mentors couldn't be updated. Kindly check.",
                });
                return;
              }
            }
            response.status(200).send({
              isSuccess: true,
              message: "Student successfully updated with Mentor details",
            });
            return;
          } else {
            response.status(400).send({
              isSuccess: true,
              message:
                "Student successfully updated with Mentor details but Mentors couldn't be updated. Kindly check.",
            });
            return;
          }
        } else {
          response
            .status(400)
            .send({ isSuccess: false, message: "Failed to update Student" });
        }
      } else {
        response
          .status(400)
          .send({ isSuccess: false, message: "No mentor to be assigned" });
        return;
      }
    } else {
      response.status(404).send({ isSuccess: false, message: "No data found" });
      return;
    }
  } catch (error) {
    response.status(400).send({ isSuccess: false, message: error.message });
  }
});

export const usersRouter = router;
