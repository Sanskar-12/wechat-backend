import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { faker, simpleFaker } from "@faker-js/faker";

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

export const createSingleChats = async (num) => {
  try {
    const users = await User.find().select("_id");
    const chatsPromise = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        chatsPromise.push(
          Chat.create({
            name: faker.lorem.words(2),
            members: [users[i], users[j]],
          })
        );
      }
    }

    await Promise.all(chatsPromise);

    console.log("Single Chats Created");
    process.exit(1);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export const createGroupChats = async (num) => {
  try {
    const users = await User.find().select("_id");
    const chatsPromise = [];

    for (let i = 0; i < num; i++) {
      const numMembers = simpleFaker.number.int({ min: 3, max: users.length });

      const members = [];
      for (let i = 0; i < numMembers; i++) {
        const randomIndex = Math.floor(Math.random() * users.length);
        const randomUser = users[randomIndex];

        if (!members.includes(randomUser)) {
          members.push(randomUser);
        }
      }

      const chat = Chat.create({
        groupChat: true,
        name: faker.lorem.words(1),
        members,
        creator: members[0],
      });

      chatsPromise.push(chat);
    }

    await Promise.all(chatsPromise);

    console.log("Group Chats Created");
    process.exit(1);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export const createMessages = async (num) => {
  try {
    const users = await User.find().select("_id");
    const chats = await Chat.find().select("_id");

    const messagePromise = [];

    for (let i = 0; i < num; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomChats = chats[Math.floor(Math.random() * chats.length)];

      messagePromise.push(
        Message.create({
          chat: randomChats,
          sender: randomUser,
          content: faker.lorem.sentence(),
        })
      );
    }

    await Promise.all(messagePromise);
    console.log("Single Messages Created");
    process.exit(1);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export const createMessagesInChat = async (chatId, num) => {
  try {
    const users = await User.find().select("_id");

    const messagePromise = [];

    for (let i = 0; i < num; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      messagePromise.push(
        Message.create({
          chat: chatId,
          sender: randomUser,
          content: faker.lorem.sentence(),
        })
      );
    }

    await Promise.all(messagePromise);
    console.log(" Messages In Chat Created");
    process.exit(1);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
