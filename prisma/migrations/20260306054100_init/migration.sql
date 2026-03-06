-- CreateTable
CREATE TABLE "Identity" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "luckyNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "wishes" TEXT,
    "selectedImages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "identityId" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "questionTitle" TEXT NOT NULL DEFAULT 'Chọn 3 bức ảnh bạn thích nhất',
    "images" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Identity_employeeId_key" ON "Identity"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Identity_luckyNumber_key" ON "Identity"("luckyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Question_identityId_key" ON "Question"("identityId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
