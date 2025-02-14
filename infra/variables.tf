# Defines input variables for the Terraform configuration.
# These values can be customized, or overridden via CLI or environment variables.

variable "aws_region" {
  type        = string
  description = "AWS region to create resources in."
  default     = "us-east-1"
}

variable "cluster_name" {
  type        = string
  description = "Name for the EKS Cluster."
  default     = "notes-eks"
}

variable "vpc_cidr_block" {
  type        = string
  description = "CIDR block for the VPC."
  default     = "10.0.0.0/16"
}

variable "public_subnets_cidrs" {
  type = list(string)
  description = "List of CIDRs for public subnets."
  default = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnets_cidrs" {
  type = list(string)
  description = "List of CIDRs for private subnets."
  default = ["10.0.2.0/24", "10.0.3.0/24"]
}

variable "enable_private_endpoints" {
  type        = bool
  description = "If true, EKS cluster endpoint is private (plus a public endpoint if desired)."
  default     = false
}

variable "desired_capacity" {
  type        = number
  description = "Desired number of nodes in the node group."
  default     = 2
}

variable "max_capacity" {
  type        = number
  description = "Maximum number of nodes in the node group."
  default     = 3
}

variable "min_capacity" {
  type        = number
  description = "Minimum number of nodes in the node group."
  default     = 1
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type for the node group."
  default     = "t3.medium"
}
