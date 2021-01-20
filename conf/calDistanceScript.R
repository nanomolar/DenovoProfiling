data <- read.csv("fpCSVfile", header = TRUE)
jaccard_simi = dist(data[, 2:ncol(data)], method = "binary")
jaccard_simi <- as.matrix(jaccard_simi)

a <- array(0,c(nrow(jaccard_simi), nrow(jaccard_simi)))
for(i in 1:nrow(jaccard_simi))
{
  for(j in 1:nrow(jaccard_simi))
  {
    a[i, j] <- paste(i, j, sep="\t")
  }
}

res <- paste(as.vector(a), as.vector(jaccard_simi),sep = "\t")
rm(a)
header <- "col\trow\tvalue"
write.table(header,"distanceCSVFile",col.names = F,row.names = F,quote = F)
write.table(res,"distanceCSVFile",col.names = F,row.names = F,quote = F,append = T)

          
