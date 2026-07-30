# infra/ — Azure Speech (HD voices) for the Hören audio

Standalone Terraform stack. Provisions one Azure **Speech** resource (kind
`SpeechServices`, SKU `S0`) in **West Europe** — the tier + region needed for the
German **DragonHD** voices (`de-DE-Seraphina:DragonHDLatestNeural`,
`de-DE-Florian:DragonHDLatestNeural`).

State is **local** (`terraform.tfstate` here) — it is intentionally separate from the
lifeos remote backend. The state file holds the access key in plaintext, so it is
git-ignored (see `.gitignore`).

## Apply

```bash
cd infra
az login                       # if not already
terraform init
terraform apply                # review, type yes
```

## Feed the key + region into the audio spike

```bash
cd ..
AZURE_SPEECH_KEY="$(terraform -chdir=infra output -raw speech_key)" \
AZURE_SPEECH_REGION="$(terraform -chdir=infra output -raw speech_region)" \
node scripts/audio/spike-azure.mjs
```

## Tear down (stop any billing)

```bash
terraform -chdir=infra destroy
```

## Notes
- `S0` is pay-as-you-go; HD voices are not on the free `F0` tier. Our volume is a few
  cents. `terraform destroy` removes the resource when you're done.
- Subscription id is set in `terraform.tfvars` (same sub as lifeos). Change `location`,
  `prefix`, or `sku_name` there or via `-var` if needed.
