// This function combine points with same description.

export const gradeReasonCombine = (student) => {
  const reasonMatch = {};

  Object.keys(student.points).map((pointId) => {
    // Do not touch if it is multi Mode
    if (student.points[pointId].multi) return pointId;
    // return pointId;

    // If it is not multimode, save in directory.
    const reason =
      student.points[pointId].desc && student.points[pointId].desc.trim();
    if (Object.keys(reasonMatch).includes(reason)) {
      student.points[reasonMatch[reason]].deduct = +Number.parseFloat(
        +student.points[reasonMatch[reason]].deduct +
          +student.points[pointId].deduct
      ).toFixed(2);

      student.points[pointId].deduct = 0;
    } else {
      reasonMatch[reason] = pointId;
    }
    return pointId;
  });

  return student;
};
