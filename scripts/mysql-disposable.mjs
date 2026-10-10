import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { promisify } from "node:util";
import process from "node:process";

const run = promisify(execFile);
const IMAGE = "mysql:8.4";
const DATABASE = "omni_disposable";
const name = `omni-disposable-mysql-${process.pid}`;
const password = randomBytes(24).toString("hex");

async function docker(args, env = {}) {
  return run("docker", args, { env: { ...process.env, ...env }, maxBuffer: 1024 * 1024 });
}

async function waitForMysql(timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await docker(
        ["exec", "-e", "MYSQL_PWD", name, "mysqladmin", "ping", "-h127.0.0.1", "--silent"],
        {
          MYSQL_PWD: password,
        },
      );
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("disposable MySQL did not become ready");
}

async function query(sql) {
  const { stdout } = await docker(
    ["exec", "-e", "MYSQL_PWD", name, "mysql", "-h127.0.0.1", "-uroot", "-N", "-B", "-e", sql],
    { MYSQL_PWD: password },
  );
  return stdout.trim();
}

async function main() {
  await docker(
    [
      "run",
      "-d",
      "--name",
      name,
      "-e",
      "MYSQL_ROOT_PASSWORD",
      "-e",
      `MYSQL_DATABASE=${DATABASE}`,
      "-p",
      "127.0.0.1::3306",
      IMAGE,
    ],
    { MYSQL_ROOT_PASSWORD: password },
  );
  await waitForMysql();

  const version = await query("SELECT VERSION()");
  if (!version.startsWith("8.4.")) throw new Error(`unexpected MySQL version: ${version}`);
  const engine = await query(
    `SELECT ENGINE FROM information_schema.ENGINES WHERE SUPPORT IN ('DEFAULT','YES') AND ENGINE='InnoDB'`,
  );
  if (engine !== "InnoDB") throw new Error("InnoDB engine not available");
  const database = await query(
    `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${DATABASE}'`,
  );
  if (database !== DATABASE) throw new Error(`database ${DATABASE} was not created`);

  console.log(`PASS: disposable MySQL ${version} (InnoDB) started on 127.0.0.1 and was queried.`);
}

main()
  .catch((error) => {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await docker(["rm", "-f", name]).catch(() => {});
  });
