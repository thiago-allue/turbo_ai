output "vpc_id" {
  description = "The VPC ID."
  value       = aws_vpc.this.id
}

output "public_subnets" {
  description = "Public subnet IDs."
  value       = [for subnet in aws_subnet.public_subnets : subnet.id]
}

output "private_subnets" {
  description = "Private subnet IDs."
  value       = [for subnet in aws_subnet.private_subnets : subnet.id]
}

output "cluster_name" {
  description = "EKS Cluster name."
  value       = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  description = "EKS Cluster endpoint."
  value       = aws_eks_cluster.this.endpoint
}

output "cluster_ca" {
  description = "EKS Cluster CA certificate (base64 encoded)."
  value       = aws_eks_cluster.this.certificate_authority[0].data
}

output "cluster_security_group" {
  description = "The EKS cluster security group ID."
  value       = aws_security_group.eks_cluster_sg.id
}

output "node_security_group" {
  description = "The EKS node security group ID."
  value       = aws_security_group.eks_node_sg.id
}
