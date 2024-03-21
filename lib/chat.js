export const otherMember = (members, userId) => {
  return members.find((member) => member._id !== userId);
};
