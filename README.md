## Summary

In Prisma v7.1.0, I couldn't update any `binary(16)` fields in MySQL database (_use case: storing UUIDv7 as binary_).


The following schema:

```prisma
model User {
  id Bytes @id @db.Binary(16)
  name String
}
```

with at least one record inserted:
```ts
import { v7, parse } from "uuid";

const generatedUuid = new Uint8Array(parse(v7()));

await prisma.user.createMany({
	data: [
		{
			id: generatedUuid,
			name: "Matthew Tirtawidjaja"
		}
	],
	skipDuplicates: true,
});
```

and the following update code:
```ts

const randomNumber = Math.floor(Math.random() * 100);

// Try updating the name
await prisma.user.update({
	where: {
		id: generatedUuid,
	},
	data: {
		name: `Matthew ${randomNumber}`,
	},
});

```

triggers the following error:
```ts
DriverAdapterError: Truncated incorrect DOUBLE value: '\x01\x9B\x11\xA6\x1B\xE2t\xBB\xA3\x8B\x18Q\xB5\x84_+'
	at MariaDbTransaction.onError (file:///tmp/AAAA/PrismaTest/poc/node_modules/@prisma/adapter-mariadb/dist/index.mjs:322:11)
	at MariaDbTransaction.performIO (file:///tmp/AAAA/PrismaTest/poc/node_modules/@prisma/adapter-mariadb/dist/index.mjs:317:12)
	at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
	at async MariaDbTransaction.executeRaw (file:///tmp/AAAA/PrismaTest/poc/node_modules/@prisma/adapter-mariadb/dist/index.mjs:294:13)
	at async /tmp/AAAA/PrismaTest/poc/node_modules/@prisma/client/runtime/client.js:11:24163
	at async fr (/tmp/AAAA/PrismaTest/poc/node_modules/@prisma/client/runtime/client.js:11:24002)
	at async e.interpretNode (/tmp/AAAA/PrismaTest/poc/node_modules/@prisma/client/runtime/client.js:11:42203)
	at async e.interpretNode (/tmp/AAAA/PrismaTest/poc/node_modules/@prisma/client/runtime/client.js:11:44866)
	at async e.interpretNode (/tmp/AAAA/PrismaTest/poc/node_modules/@prisma/client/runtime/client.js:11:41603)
	at async e.interpretNode (/tmp/AAAA/PrismaTest/poc/node_modules/@prisma/client/runtime/client.js:11:43982) {
cause: {
	originalCode: '1292',
	originalMessage: "Truncated incorrect DOUBLE value: '\\x01\\x9B\\x11\\xA6\\x1B\\xE2t\\xBB\\xA3\\x8B\\x18Q\\xB5\\x84_+'",
	kind: 'mysql',
	code: 1292,
	message: "Truncated incorrect DOUBLE value: '\\x01\\x9B\\x11\\xA6\\x1B\\xE2t\\xBB\\xA3\\x8B\\x18Q\\xB5\\x84_+'",
	state: '22007'
},
clientVersion: '7.1.0'
}
```

----

## Starting Everything Up

1. Clone the repo

2. Copy over the example env (the defaults should work fine)
	```bash
	cp .env.example .env
	```

3. Choose either the full docker setup or the manual setup below:

	### Docker Instructions

	1. Build the mysql + poc containers
	```bash
	docker compose build
	```

	2. Create the mysql data directory
	```bash
	mkdir .docker/mysql/data
	```

	3. Start the containers
	```bash
	docker compose up
	```

	### Manual Instructions

    1. (Optional) Use docker to get a clean MySQL instance <br>
	    To make it easier for me to test, I just use docker to run a mysql instance with root:root as the credentials.

        > You can of course use any mysql instance you want, just update the .env file accordingly.

   		1. Build and start the docker containers
		```bash
		docker compose build
		```

		2. Create the mysql data directory
		```bash
		mkdir .docker/mysql/data
		```

		3. Start the container
		```bash
		docker compose up mysql --detach
		```

   		4. Wait for mysql to be ready before starting the poc<br>(_You can check the logs with `docker compose logs --follow mysql`_)

    2. Start the poc<br>
		1. Go to the `poc/` directory
		```bash
		cd poc
		```

		2. Install dependencies
		```bash
		npm install
		```

		3. Generate the prisma client
		```bash
		npx dotenv -e ../.env -- npx prisma generate
		```

		4. Apply migrations
		```bash
		npx dotenv -e ../.env -- npx prisma migrate deploy
		```

		5. Build the poc
		```bash
		tsc -p tsconfig.json
		```

		6. Run the poc
		```bash
		npx dotenv -e ../.env -- node dist/src/main.js
		```

----

## Shutting everything down

### Docker Instructions
```bash
docker compose down
sudo rm -rf .docker/mysql/data
rm .env
```

### Manual Instructions
```bash
rm -rf node_modules/ prisma/generated/ dist/
cd ..
docker compose down
sudo rm -rf .docker/mysql/data
rm .env
```