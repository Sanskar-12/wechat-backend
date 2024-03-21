import { User } from "../models/user.js";
import { faker } from "@faker-js/faker";

export const createUser = async (numUsers) => {
  try {
    const usersPromise = [];

    for (let i = 0; i < numUsers; i++) {
      const tempUsers = User.create({
        name: faker.person.fullName(),
        username: faker.internet.userName(),
        bio: faker.lorem.sentence(10),
        password: "password",
        avatar: {
          url: faker.image.avatar(),
          public_id: faker.system.fileName(),
        },
      });

      usersPromise.push(tempUsers);
    }

    await Promise.all(usersPromise);

    console.log("Users created", numUsers);

    process.exit(1);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};