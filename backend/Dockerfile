FROM node:20-alpine

WORKDIR /app

# 一次複製多個檔案，用空格分開
# ./ 指的是容器內的 /app 目錄。
COPY package.json package-lock.json ./ 

# 跑 npm ci 裝依賴。不安裝 devDependencies。
RUN npm ci --omit=dev

# 最後才複製其餘程式碼
COPY . .

EXPOSE 8080

# container run 時跑 CMD
CMD ["npm", "start"] 
