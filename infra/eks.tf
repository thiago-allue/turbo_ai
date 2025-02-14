# Manages the EKS cluster and node group, including VPC configuration for subnets.

resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  role_arn = aws_iam_role.cluster_role.arn

  # VPC config references the private subnets for EKS
  vpc_config {
    subnet_ids = [
      for subnet in aws_subnet.private_subnets : subnet.id
    ]
    endpoint_private_access = var.enable_private_endpoints
    endpoint_public_access  = true
    security_group_ids = [aws_security_group.eks_cluster_sg.id]
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_policy_attachment_eks_cluster_policy,
    aws_iam_role_policy_attachment.cluster_policy_attachment_eks_service_policy
  ]
}

resource "aws_eks_node_group" "this" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.cluster_name}-nodegroup"
  node_role_arn   = aws_iam_role.node_role.arn

  subnet_ids = [
    for subnet in aws_subnet.private_subnets : subnet.id
  ]

  scaling_config {
    desired_size = var.desired_capacity
    max_size     = var.max_capacity
    min_size     = var.min_capacity
  }
  disk_size = 20
  instance_types = [var.instance_type]

  depends_on = [
    aws_eks_cluster.this,
    aws_iam_role_policy_attachment.node_policy_attachment_eks_worker,
    aws_iam_role_policy_attachment.node_policy_attachment_eks_cni,
    aws_iam_role_policy_attachment.node_policy_attachment_eks_cw_agent
  ]
}

# Allows cluster SG to communicate with node SG
resource "aws_security_group_rule" "cluster_to_node" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  security_group_id        = aws_security_group.eks_node_sg.id
  source_security_group_id = aws_security_group.eks_cluster_sg.id
}

# Allows node SG to communicate with cluster SG
resource "aws_security_group_rule" "node_to_cluster" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  security_group_id        = aws_security_group.eks_cluster_sg.id
  source_security_group_id = aws_security_group.eks_node_sg.id
}
