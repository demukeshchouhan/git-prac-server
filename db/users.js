import { connection } from "./connection.js";

const getUserTable = () => connection.table("user");
const getLoginTable = () => connection.table("login");

export async function getUser(id) {
  const q = await getUserTable().first();
  return await getUserTable().first().where({ id });
}
export async function getUserByName(username) {
  return await getLoginTable().first().where({ username });
}

export async function getUserByEmail(email) {
  return await getUserTable().first().where({ email });
}
