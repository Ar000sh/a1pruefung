variable "subscription_id" {
  type        = string
  description = "Azure subscription id (az account show --query id -o tsv)."
}

variable "location" {
  type        = string
  default     = "francecentral"
  description = <<-EOT
    Region for the Speech resource. Must host the DragonHD ("HD") voices AND be
    permitted by this subscription's "Allowed locations" Azure Policy.
    HD-voice regions (per docs): eastus, eastus2, westus2, canadacentral,
    centralindia, francecentral, southeastasia, swedencentral, westeurope.
    westeurope is blocked by the subscription policy (403 RequestDisallowedByAzure);
    norwayeast/germanywestcentral do NOT have HD voices. swedencentral has HD voices
    and is in the same Nordic set as norwayeast (which the policy already allows).
    If swedencentral is also policy-blocked, try francecentral next.
  EOT
}

variable "prefix" {
  type        = string
  default     = "a1audio"
  description = "Name prefix for resources."
}

variable "sku_name" {
  type        = string
  default     = "S0"
  description = <<-EOT
    Cognitive Services pricing tier. Must be S0 (pay-as-you-go): the HD voices are
    NOT available on the free F0 tier. For our ~60 short items the cost is a few cents.
  EOT
}
