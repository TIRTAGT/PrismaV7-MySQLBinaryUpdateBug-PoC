import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../prisma/generated/client.js";
import { v7, parse } from "uuid";

const RequiredEnvs = [
	"DATABASE_HOST",
	"DATABASE_PORT",
	"DATABASE_USER",
	"DATABASE_PASSWORD",
	"DATABASE_NAME",
];

for (const env of RequiredEnvs) {
	if (!process.env[env]) {
		throw new Error(`Missing required environment variable: ${env}`);
	}
}


const prisma = new PrismaClient({
	adapter: new PrismaMariaDb({
		host: process.env["DATABASE_HOST"]!,
		port: Number(process.env["DATABASE_PORT"]),
		user: process.env["DATABASE_USER"]!,
		password: process.env["DATABASE_PASSWORD"]!,
		database: process.env["DATABASE_NAME"]!,
		allowPublicKeyRetrieval: true
	}),
});

async function main() {
	const generatedUuid = new Uint8Array(parse(v7()));

	await prisma.user.createMany({
		data: [
			{ id: generatedUuid, name: "Matthew Tirtawidjaja" }
		],
		skipDuplicates: true
	});

	const randomNumber = Math.floor(Math.random() * 100);

	await prisma.user.update({
		where: { id: generatedUuid },
		data: {
			name: `Matthew ${randomNumber}`
		}
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});