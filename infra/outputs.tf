# Read secrets with:  terraform output -raw <name>
# These two feed the audio spike directly:
#   AZURE_SPEECH_KEY=$(terraform output -raw speech_key)
#   AZURE_SPEECH_REGION=$(terraform output -raw speech_region)

output "speech_region" {
  description = "Region short name → AZURE_SPEECH_REGION (e.g. westeurope)."
  value       = azurerm_cognitive_account.speech.location
}

output "speech_key" {
  description = "Primary access key → AZURE_SPEECH_KEY. Sensitive; read with `terraform output -raw speech_key`."
  value       = azurerm_cognitive_account.speech.primary_access_key
  sensitive   = true
}

output "speech_endpoint" {
  description = "Account endpoint (informational). REST TTS uses the regional tts.speech.microsoft.com host + key."
  value       = azurerm_cognitive_account.speech.endpoint
}
