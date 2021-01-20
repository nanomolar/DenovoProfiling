data <- read.csv("fpCSVfile", header = TRUE,sep = ",")
data <- data[, 2:ncol(data)]
data.pr <- prcomp(data)
a<-predict(data.pr)
res <- paste(a[,1],a[,2],sep = "\t")
header <- "PC1\tPC2"
write.table(header,"pcaCSVfile",col.names = F,row.names = F,quote = F)
write.table(res,"pcaCSVfile",col.names = F,row.names = F,quote = F,append = T)
