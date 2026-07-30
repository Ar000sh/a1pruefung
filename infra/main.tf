resource "azurerm_resource_group" "main" {
  name     = "rg-${var.prefix}"
  location = var.location
}

# Cognitive Services accounts have soft-delete: a deleted account reserves its name
# for a while. A short random suffix avoids "name already taken" on re-create.
resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

# The Azure Speech (Text-to-Speech) resource. Key-based REST calls go to the
# regional endpoint https://<location>.tts.speech.microsoft.com/cognitiveservices/v1
# using the primary access key — see outputs below.
resource "azurerm_cognitive_account" "speech" {
  name                = "speech-${var.prefix}-${random_string.suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "SpeechServices"
  sku_name            = var.sku_name

  tags = {
    project = "a1pruefung"
    purpose = "hoeren-tts"
  }
}
