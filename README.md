[前端地址](https://github.com/xun082/online-edit-web)

本项目使用 Docker 进行容器化管理，确保你能够轻松启动并运行项目。无需额外配置，只需确保本地安装了 Docker，即可开始运行项目。

在启动项目之前，请确保你已在本地安装并运行以下工具：

- [Docker](https://www.docker.com/)（确保 Docker 已安装并运行）

首先，克隆项目的源代码到本地：

```bash
git clone https://github.com/xun082/online-edit-server.git
```

```bash
cd online-edit-server
```

通过 Docker Compose 一条命令即可启动项目：

```bash
docker-compose up -d
```

等待启动完成之后即可启动NestJs项目：

```bash
pnpm start:dev
```
