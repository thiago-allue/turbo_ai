resource "aws_vpc" "this" {
  cidr_block = var.vpc_cidr_block
  tags = {
    Name = "${var.cluster_name}-vpc"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags = {
    Name = "${var.cluster_name}-igw"
  }
}

# Create public subnets
resource "aws_subnet" "public_subnets" {
  count                   = length(var.public_subnets_cidrs)
  vpc_id                  = aws_vpc.this.id
  cidr_block             = var.public_subnets_cidrs[count.index]
  map_public_ip_on_launch = true
  availability_zone       = element(data.aws_availability_zones.available.names, count.index)
  tags = {
    Name = "${var.cluster_name}-public-${count.index}"
  }
}

# Create private subnets
resource "aws_subnet" "private_subnets" {
  count             = length(var.private_subnets_cidrs)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnets_cidrs[count.index]
  availability_zone = element(data.aws_availability_zones.available.names, count.index)
  tags = {
    Name = "${var.cluster_name}-private-${count.index}"
  }
}

# NAT EIP addresses
resource "aws_eip" "nat" {
  count = length(var.public_subnets_cidrs)
  vpc   = true

  depends_on = [aws_internet_gateway.this]
  tags = {
    Name = "${var.cluster_name}-nat-eip-${count.index}"
  }
}

# NAT Gateways (one per public subnet for a highly available scenario)
resource "aws_nat_gateway" "this" {
  count         = length(var.public_subnets_cidrs)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public_subnets[count.index].id
  tags = {
    Name = "${var.cluster_name}-natgw-${count.index}"
  }
  depends_on = [aws_internet_gateway.this]
}

# Public route tables and routes
resource "aws_route_table" "public_rtb" {
  count  = length(var.public_subnets_cidrs)
  vpc_id = aws_vpc.this.id
  tags = {
    Name = "${var.cluster_name}-public-rtb-${count.index}"
  }
}

resource "aws_route" "public_default_route" {
  count                = length(var.public_subnets_cidrs)
  route_table_id       = aws_route_table.public_rtb[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id           = aws_internet_gateway.this.id
  depends_on           = [aws_internet_gateway.this]
}

# Associate each public subnet with its corresponding route table
resource "aws_route_table_association" "public_association" {
  count          = length(var.public_subnets_cidrs)
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rtb[count.index].id
}

# Private route tables and routes
resource "aws_route_table" "private_rtb" {
  count  = length(var.private_subnets_cidrs)
  vpc_id = aws_vpc.this.id
  tags = {
    Name = "${var.cluster_name}-private-rtb-${count.index}"
  }
}

resource "aws_route" "private_default_route" {
  count                = length(var.private_subnets_cidrs)
  route_table_id       = aws_route_table.private_rtb[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id       = element(aws_nat_gateway.this.*.id, count.index % length(aws_nat_gateway.this.*.id))
  depends_on           = [aws_nat_gateway.this]
}

# Associate each private subnet with its corresponding route table
resource "aws_route_table_association" "private_association" {
  count          = length(var.private_subnets_cidrs)
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_rtb[count.index].id
}

data "aws_availability_zones" "available" {
  state = "available"
}
