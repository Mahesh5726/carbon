import { PrismaClient } from "@prisma/client";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();
const prisma = new PrismaClient();

app.get("/students", async (context) => {
  try {
    const student = await prisma.student.findMany();
    return context.json(student);
  } catch (error) {
    console.error("Error finding student data: ", error);
    return context.json("404 Error: Data not found.", 404);
  }
});

app.get("/students/enriched", async (context) => {
  try {
    const enriched = await prisma.student.findMany({
      include: {
        proctor: true,
      },
    });
    return context.json(enriched);
  } catch (error) {
    console.error("Error finding student's proctorship data: ", error);
    return context.json("404 Error: Data not found.", 404);
  }
});

app.get("/professors", async (context) => {
  try {
    const professor = await prisma.professor.findMany();
    return context.json(professor);
  } catch (error) {
    console.error("Error finding professor data: ", error);
    return context.json("404 Error: Data not found.", 404);
  }
});

app.post("/students", async (context) => {
  const { name, dateOfBirth, aadharNumber } = await context.req.json();
  try {
    const aadharExists = await prisma.student.findUnique({
      where: {
        aadharNumber: aadharNumber,
      },
    });
    if (aadharExists) {
      return context.json("Error: Aadhar number already exists.", 400);
    }

    const student = await prisma.student.create({
      data: {
        name: name,
        dateOfBirth: dateOfBirth,
        aadharNumber: aadharNumber,
      },
    });
    return context.json(student, 200);
  } catch (error) {
    console.error("Error creating student: ", error);
    return context.json("404 Error: Unable to create a student data.", 400);
  }
});

app.post("/professors", async (context) => {
  const { name, seniority, aadharNumber } = await context.req.json();
  try {
    const aadharExists = await prisma.professor.findUnique({
      where: {
        aadharNumber: aadharNumber,
      },
    });

    if (aadharExists) {
      return context.json("Error: Aadhar number already exists.", 400);
    }

    const prof = await prisma.professor.create({
      data: {
        name: name,
        seniority: seniority,
        aadharNumber: aadharNumber,
      },
    });

    return context.json(prof, 200);
  } catch (error) {
    console.error("Error creating professor: ", error);
    return context.json("404 Error: Unable to create a professor data.", 404);
  }
});

app.get("/professors/:professorId/proctorships", async (context) => {
  const professorId = context.req.param("professorId");
  try {
    const students = await prisma.student.findMany({
      where: {
        proctorId: professorId,
      },
    });
    return context.json(students);
  } catch (error) {
    console.error("Error finding proctorship: ", error);
    return context.json("404 Error: Unable to find proctorships.", 404);
  }
});

app.patch("/students/:studentId", async (context) => {
  const studentId = context.req.param("studentId");
  const { name, dateOfBirth, aadharNumber, proctorId } =
    await context.req.json();
  try {
    const uniqueStudentId = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    //does proctorId exists or not

    if (!uniqueStudentId) {
      return context.json("404 Error: Unable to find student data.", 404);
    }
    const student = await prisma.student.update({
      where: {
        id: studentId,
      },
      data: {
        name: name,
        dateOfBirth: dateOfBirth,
        aadharNumber: aadharNumber,
        proctorId: proctorId,
      },
    });
    return context.json(student, 200);
  } catch (error) {
    console.error("Error updating student data: ", error);
    return context.json("404 Error: Unable to update student data.", 404);
  }
});

app.patch("/professors/:professorId", async (context) => {
  const professorId = context.req.param("professorId");
  const { name, seniority, aadharNumber } = await context.req.json();
  try {
    const uniqueProfessorId = await prisma.professor.findUnique({
      where: {
        id: professorId,
      },
    });
    if (!uniqueProfessorId) {
      return context.json("404 Error: Unable to find professor data.", 404);
    }

    const professor = await prisma.professor.update({
      where: {
        id: professorId,
      },
      data: {
        name: name,
        seniority: seniority,
        aadharNumber: aadharNumber,
      },
    });
    return context.json(professor, 200);
  } catch (error) {
    console.error("Error updating professor data: ", error);
    return context.json("404 Error: Unable to update professor data.", 404);
  }
});

app.delete("/students/:studentId", async (context) => {
  const studentId = context.req.param("studentId");
  try {
    const uniqueStudentId = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!uniqueStudentId) {
      return context.json("404 Error: Unable to find student data.", 404);
    }

    const deletedStudent = await prisma.student.delete({
      where: {
        id: studentId,
      },
    });

    return context.json({ "Deleted Student": deletedStudent }, 200);
  } catch (error) {
    console.error("Error deleting student data: ", error);
    return context.json("404 Error: Unable to delete student data.", 404);
  }
});

app.delete("/professors/:professorId", async (context) => {
  const profId = context.req.param("professorId");
  try {
    const uniqueProfessorId = await prisma.professor.findUnique({
      where: {
        id: profId,
      },
    });

    if (!uniqueProfessorId) {
      return context.json("404 Error: Unable to find professor data.", 404);
    }

    const deletedProfessor = await prisma.professor.delete({
      where: {
        id: profId,
      },
    });

    return context.json({ "Deleted Professor": deletedProfessor }, 200);
  } catch (error) {
    console.error("Error deleting professor data: ", error);
    return context.json("404 Error: Unable to delete professor data.", 404);
  }
});

app.post("/professors/:professorId/proctorships", async (context) => {
  const profId = context.req.param("professorId");
  const { studentId } = await context.req.json();

  try {
    const existProf = await prisma.professor.findUnique({
      where: { id: profId },
    });
    if (!existProf) {
      return context.json("404 Error: Unable to find professor data.", 404);
    }

    const existStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!existStudent) {
      return context.json("404 Error: Unable to find student data.", 404);
    }

    const updateStudentProctorship = await prisma.student.update({
      where: { id: studentId },
      data: { proctorId: profId },
    });

    return context.json(
      { "Updated Student Proctorship ": updateStudentProctorship },
      200
    );
  } catch (error) {
    console.error("Error assigning student proctorship: ", error);
    return context.json("404 Error: Unable to assign student proctorship", 404);
  }
});

serve(app);
