1. 判断偶数，选择偶数------>（后-前）
2. 拿到列的具体值；列求和
3. Id 去重；求重复的个数
4. Group  by 单个 id

单个 id 来讲
``` mysql
	
	//先遍历每个id,求出每个id的长度即重复次数
	
	a=0;//a就是id去重后的数量
	id.length;//总的长度
	id_a_total=0;//每个相同的id之和
	
	定义一个指针
	while（index<=id.length）{
	
	if(num[index]==a)
	id_a_length++;//每个id重复的次数加1	
	id_a_total=id_a_total+a//每个相同的id之和
	index++；//指针加1，继续遍历		
	else（a++;）//否则id加1,计算下一个id的重复数量
	return a;//a就是id去重后的数量
	
	}

	
	
	//再计算每个id的avg
	total=0；
	for(a=2;a<=id的重复个数；a=a+2){
	
	total=num[a]-num[(a-1)];
	}
	
	id_a_total/id_a_length=average time as processing_time;
	
	select machine_id,processing_time
	from Activity table
	group by machine_id;
```


![[SQL手搓笔记 2026-04-08 12.52.41.excalidraw]]
![[SQL手搓笔记 2026-04-09 23.03.42.excalidraw]]