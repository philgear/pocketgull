# HIPAA-Compliant Infrastructure Setup

This directory contains the Terraform configuration to deploy Pocket Gull in a highly secure, HIPAA-compliant configuration on Google Cloud Run.

## Why is this HIPAA-ready?

1. **Local-First Architecture:** Pocket Gull fundamentally processes PHI locally on the client's device. No long-term PHI storage exists in this cloud infrastructure.
2. **Private Egress (VPC Connector):** The Serverless VPC Access connector ensures that outbound API requests (e.g., to Google's Gemini Vertex models) traverse Google's internal network backbone rather than the public internet.
3. **Internal Ingress:** The `main.tf` restricts ingress to `INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER`, meaning the clinical application can only be accessed by clinicians connected to your organization's VPN or corporate intranet—not the open web.
4. **Log Sanitization:** The environment variables explicitly enforce a `warn` level log output across the application to prevent any accidental request payloads (like transcribed symptoms) from being dumped to Cloud Logging.

## Usage

If you prefer using the standard `gcloud` CLI instead of Terraform, you can achieve the same environment constraints by running:

```bash
npm run deploy:secure
```

To use Terraform:
1. Ensure `gcloud` is authenticated and your Google Cloud project is set.
2. Run `terraform init`.
3. Run `terraform plan` to view resources.
4. Run `terraform apply` to provision the secure VPC and Cloud Run instance.
