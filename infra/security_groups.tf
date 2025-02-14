resource "aws_security_group" "eks_cluster_sg" {
  name        = "${var.cluster_name}-cluster-sg"
  description = "Security group for the EKS cluster"
  vpc_id      = aws_vpc.this.id

  ingress {
    description      = "Allow all traffic within the security group"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    self             = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-cluster-sg"
  }
}

resource "aws_security_group" "eks_node_sg" {
  name        = "${var.cluster_name}-node-sg"
  description = "Security group for the EKS node group"
  vpc_id      = aws_vpc.this.id

  # Node to Node
  ingress {
    description      = "Allow node to node traffic"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    self             = true
  }

  # Allow inbound from cluster security group
  ingress {
    description      = "Allow inbound traffic from EKS cluster"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    security_groups  = [aws_security_group.eks_cluster_sg.id]
  }

  # Egress
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-node-sg"
  }
}
