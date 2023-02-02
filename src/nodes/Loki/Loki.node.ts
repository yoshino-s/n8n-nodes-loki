import type { IExecuteFunctions } from "n8n-core";
import { INodeType, INodeTypeDescription, INodeExecutionData } from "n8n-workflow";

type Stream = {
	stream: Record<string, string>;
	values: [string, string][];
};

export class Loki implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Loki",
		name: "Loki",
		icon: "file:loki.svg",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["url"]}}',
		description: "Interact with Loki",
		defaults: {
			name: "Loki",
		},
		inputs: ["main"],
		outputs: ["main"],
		requestDefaults: {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		},
		properties: [
			{
				displayName: "URL",
				name: "url",
				type: "string",
				default: "",
				placeholder: "http://loki.example.com/",
				description: "The Loki endpoint to make the request to",
				required: true,
			},
			{
				displayName: "Specify Labels",
				name: "specifyLabel",
				type: "options",
				options: [
					{
						name: "Using Fields Below",
						value: "keypair",
					},
					{
						name: "Using JSON",
						value: "json",
					},
				],
				default: "keypair",
			},
			{
				displayName: "Labels",
				name: "labelPairs",
				type: "fixedCollection",
				displayOptions: {
					show: {
						specifyLabel: ["keypair"],
					},
				},
				placeholder: "Add Label",
				typeOptions: {
					multipleValues: true,
				},
				default: {
					parameters: [
						{
							name: "",
							value: "",
						},
					],
				},
				options: [
					{
						name: "parameters",
						displayName: "Labels",
						values: [
							{
								displayName: "Label",
								name: "label",
								type: "string",
								default: "",
							},
							{
								displayName: "Value",
								name: "value",
								type: "string",
								default: "",
							},
						],
					},
				],
			},
			{
				displayName: "JSON",
				name: "jsonLabels",
				type: "json",
				displayOptions: {
					show: {
						specifyLabel: ["json"],
					},
				},
				default: "",
			},
			// log
			{
				displayName: "Specify Logs",
				name: "specifyLog",
				type: "options",
				options: [
					{
						name: "Using Fields Below",
						value: "keypair",
					},
					{
						name: "Using JSON",
						value: "json",
					},
				],
				default: "keypair",
			},
			{
				displayName: "Logs",
				name: "logPairs",
				type: "fixedCollection",
				displayOptions: {
					show: {
						specifyLog: ["keypair"],
					},
				},
				placeholder: "Add Log",
				typeOptions: {
					multipleValues: true,
				},
				default: {
					parameters: [
						{
							timestamp: "={{Date.now()*1000000}}",
							log: "",
						},
					],
				},
				options: [
					{
						name: "parameters",
						displayName: "Logs",
						values: [
							{
								displayName: "Timestamp",
								name: "timestamp",
								type: "string",
								default: "={{Date.now()*1000000}}",
								placeholder: "unix epoch in nanoseconds",
							},
							{
								displayName: "Value",
								name: "log",
								type: "string",
								default: "",
								placeholder: "log line",
							},
						],
					},
				],
			},
			{
				displayName: "JSON",
				name: "jsonLogs",
				type: "json",
				displayOptions: {
					show: {
						specifyLog: ["json"],
					},
				},
				default: "[]",
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const streams: Record<string, Stream[]> = {};

		for (let i = 0; i < items.length; i++) {
			const url = this.getNodeParameter("url", i) as string;
			const labelPairs = this.getNodeParameter("labelPairs.parameters", i, []) as [
				{ label: string; value: string },
			];
			const specifyLabel = this.getNodeParameter("specifyLabel", i, "keypair") as string;
			const jsonLabels = this.getNodeParameter("jsonQuery", i, "") as string;

			const specifyLog = this.getNodeParameter("specifyLog", i, "keypair") as string;
			const logPairs = this.getNodeParameter("logPairs.parameters", i, []) as [
				{ timestamp: string; log: string },
			];
			const jsonLogs = this.getNodeParameter("jsonLogs", i, "[]") as string;

			const labels: Record<string, string> = {};
			if (specifyLabel === "keypair") {
				labelPairs.forEach(({ label, value }) => {
					labels[label] = value;
				});
			} else {
				Object.assign(labels, JSON.parse(jsonLabels));
			}
			const values = [];
			if (specifyLog === "keypair") {
				logPairs.forEach(({ timestamp, log }) => {
					values.push([timestamp.toString(), log]);
				});
			} else {
				JSON.parse(jsonLogs).forEach(({ timestamp, value }) => {
					values.push([timestamp.toString(), value]);
				});
			}
			streams[url] ??= [];
			streams[url].push({
				stream: labels,
				values,
			});
		}

		await Promise.all(
			Object.entries(streams).map(([url, streams]) => {
				this.sendMessageToUI({
					uri: `${url}/loki/api/v1/push`,
					method: "POST",
					body: { streams },
				});
				return this.helpers.request({
					uri: `${url}/loki/api/v1/push`,
					method: "POST",
					body: { streams },
				});
			}),
		);

		return this.prepareOutputData(items);
	}
}
