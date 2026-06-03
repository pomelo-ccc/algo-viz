export interface SortingContentItem {
  title: string;
  summary: string;
  howItWorks: string;
  complexityNote: string;
  sourceLabel: string;
  sourceUrl: string;
}

export const sortingOverview = {
  title: '排序算法总览',
  summary:
    '排序算法用于把一组无序数据重新排列成有序序列。它们既是数据结构课程中的基础主题，也是搜索、索引、数据库处理和大量工程系统里的常见预处理步骤。',
  howItWorks:
    '不同算法的差异主要在于如何比较元素、如何移动元素，以及如何在时间复杂度、空间占用和稳定性之间做取舍。可视化能帮助你看清每一次比较、交换、插入或划分是怎样逐步塑造最终顺序的。',
  complexityNote:
    '在小规模数据、近乎有序数据、需要稳定性，或者需要节省额外空间时，适合的排序策略并不相同。',
};

export const sortingContent: Record<string, SortingContentItem> = {
  bubble: {
    title: '冒泡排序',
    summary:
      '冒泡排序通过重复遍历数组，比较相邻元素，并在顺序错误时交换它们。每一轮结束后，当前未排序区间里的最大元素都会被“冒”到末尾。',
    howItWorks:
      '它从左到右连续检查相邻元素，若前者大于后者就交换。随着轮次增加，尾部已排好序的区间逐渐扩大，因此后续遍历的范围会越来越短。',
    complexityNote:
      '它稳定、原地实现简单，但平均和最坏时间复杂度都是 O(n²)，因此更适合作为教学示例或非常小的数据集。',
    sourceLabel: 'Bubble Sort Algorithm - GeeksforGeeks',
    sourceUrl: 'https://www.geeksforgeeks.org/bubble-sort-algorithm/',
  },
  selection: {
    title: '选择排序',
    summary:
      '选择排序会把数组分成已排序区和未排序区，每一轮都从未排序区中找出最小元素，再放到当前起始位置。',
    howItWorks:
      '它不会像冒泡排序那样频繁交换相邻元素，而是先扫描整段未排序数据，确定最小值的位置后再做一次交换，因此写入次数较少。',
    complexityNote:
      '它是原地排序，空间复杂度 O(1)，但平均和最坏时间复杂度仍然是 O(n²)，并且通常不稳定。',
    sourceLabel: 'Selection Sort - GeeksforGeeks',
    sourceUrl: 'https://www.geeksforgeeks.org/selection-sort/',
  },
  insertion: {
    title: '插入排序',
    summary:
      '插入排序把前面的部分视为已排序区，然后依次取出后续元素，将它插入到前面合适的位置，过程很像整理手中的扑克牌。',
    howItWorks:
      '从第二个元素开始，当前元素会与左侧已排序区逐步比较，并把更大的元素向右挪动，直到为当前元素腾出正确位置。',
    complexityNote:
      '它稳定、原地，而且在数据本来就接近有序时表现很好；但在逆序或大规模无序数据上，最坏时间复杂度仍为 O(n²)。',
    sourceLabel: 'Insertion Sort Algorithm - GeeksforGeeks',
    sourceUrl: 'https://www.geeksforgeeks.org/insertion-sort-algorithm/',
  },
  quick: {
    title: '快速排序',
    summary:
      '快速排序属于分治法。它选择一个枢轴，将数组划分为“小于枢轴”和“大于等于枢轴”的两部分，再递归处理左右子区间。',
    howItWorks:
      '每一轮核心是 partition：先选定 pivot，再把元素重排到 pivot 两侧，使得 pivot 落到最终位置。之后只需继续处理两边尚未排好的部分。',
    complexityNote:
      '平均时间复杂度为 O(n log n)，通常非常快，但当枢轴选得很差时最坏会退化到 O(n²)，而且它通常不稳定。',
    sourceLabel: 'Quick Sort - GeeksforGeeks',
    sourceUrl: 'https://www.geeksforgeeks.org/quick-sort/',
  },
  merge: {
    title: '归并排序',
    summary:
      '归并排序同样使用分治思想。它先不断把数组拆分成更小的子数组，再把这些已经局部有序的小段按顺序合并回来。',
    howItWorks:
      '拆分阶段把问题递归细化到长度为 1 的数组；合并阶段则同时扫描左右两段，把更小的元素依次写回结果数组，从而重新构建整体顺序。',
    complexityNote:
      '它的时间复杂度稳定在 O(n log n)，并且天然稳定，但需要额外的辅助空间来完成合并。',
    sourceLabel: 'Merge Sort - GeeksforGeeks',
    sourceUrl: 'https://www.geeksforgeeks.org/merge-sort/',
  },
  heap: {
    title: '堆排序',
    summary:
      '堆排序建立在二叉堆结构之上。对于升序排序，通常先把数组原地构造成大顶堆，再不断把堆顶最大值放到末尾。',
    howItWorks:
      '构建大顶堆后，根节点就是当前最大元素。将它与末尾交换后缩小堆范围，再执行 heapify 恢复堆性质，重复直到全部完成。',
    complexityNote:
      '它在最好、平均、最坏情况下都能保持 O(n log n)，且可以原地完成，但通常不稳定，且常数开销往往高于快速排序。',
    sourceLabel: 'Heap Sort - GeeksforGeeks',
    sourceUrl: 'https://www.geeksforgeeks.org/heap-sort/',
  },
  shell: {
    title: '希尔排序',
    summary:
      '希尔排序可以看作插入排序的改进版。它先让相距较远的元素进行比较和移动，再逐步缩小间隔，最后在 gap 为 1 时完成收尾。',
    howItWorks:
      '算法会选择一组 gap 序列，例如 n/2、n/4 直到 1。每个 gap 下都执行“带间隔的插入排序”，从而先解决大范围错位，再处理局部细节。',
    complexityNote:
      '它仍是原地比较排序，实际性能通常比简单 O(n²) 排序好得多，但复杂度高度依赖 gap 序列，并且通常不稳定。',
    sourceLabel: 'Shell Sort - GeeksforGeeks',
    sourceUrl: 'https://www.geeksforgeeks.org/dsa/shell-sort/',
  },
  counting: {
    title: '计数排序',
    summary:
      '计数排序不是基于比较的排序。它通过统计每个值出现的次数，并利用前缀和来直接确定元素在结果数组中的位置。',
    howItWorks:
      '先遍历输入数据得到频次数组，再把频数转成前缀和。随后从右向左扫描原数组，把每个元素放到输出数组的正确索引上，这样可以保持稳定性。',
    complexityNote:
      '当取值范围较小、且与元素数量同量级时它非常高效；但如果值域过大，额外空间和初始化成本会明显上升。',
    sourceLabel: 'Counting Sort - GeeksforGeeks',
    sourceUrl: 'https://www.geeksforgeeks.org/counting-sort',
  },
  radix: {
    title: '基数排序',
    summary:
      '基数排序按位处理数据，从最低位到最高位依次进行稳定排序。它不直接比较元素大小，而是反复依据当前位的值分配到对应桶中。',
    howItWorks:
      '先找出最大值以确定需要处理多少位，然后按个位、十位、百位依次执行稳定排序。只要每一轮内部排序稳定，最终整体顺序就会正确。',
    complexityNote:
      '它适合整数或固定长度键值，复杂度常写为 O(d(n + b))；当位数不多、基数固定时，对大批量数据通常很有吸引力。',
    sourceLabel: 'Radix Sort - GeeksforGeeks',
    sourceUrl: 'https://www.geeksforgeeks.org/dsa/radix-sort/',
  },
};
