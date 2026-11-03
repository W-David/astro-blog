---
title: "二分查找-扩展"
description: "二分查找及若干边界变种的 C++ 实现。"
pubDate: 2020-01-23
category: "算法"
tags: []
---

## 二分查找
二分查找是一个基础算法，基本思想就是将查找的键和子数组的中间键作比较，如果查找的键小于中间键，那么在左子数组继续查找；如果大于中间键，那么在右子数组中查找，否则中间键就是要查找的元素。
**CODE ⇩⇩⇩**
```cpp
int binarySearch(const int *arr,int n,int key){
    int lo = 0,hi = n-1;
    while(lo <= hi){
        int mid = lo + (hi-lo)/2;
        int cmp = arr[mid] - key;
        if(cmp == 0) return mid;
        if(cmp < 0) lo = mid +1;
        else hi = mid - 1;
    }
    return -1;
}
```
**注意点:** 判断条件必须是**lo<=hi**,否则判断条件不完整。
## 二分查找的变种
如果二分查找的条件发生变化，比如：数组中的元素重复，要求返回匹配的数据的最大或最小下标；更进一步，需要找出数组中第一个大于Key的元素（最小的大于Key的元素）下标。
**实现的主体代码不发生变化，主要就是判断条件的变化（边界条件）**

### 查找第一个与Key相等的元素
**有重复值，找到等于Key的最左边元素的下标**
```cpp
int binarySearch(const int *arr,int n,int key){
    int lo = 0,hi = n-1;
    while(lo <= hi){
        int mid = lo + (hi-lo)/2;
        int cmp = arr[mid] - key;
        if(cmp < 0) lo = mid +1;
        else hi = mid - 1;
    }
    if(lo < n && arr[lo] == key) return lo;
    return -1;
}
```
### 查找最后一个与Key相等的元素
**多重复值，找到等于Key的最右边元素的下标**
```cpp
int binarySearch(const int *arr,int n,int key){
    int lo = 0,hi = n-1;
    while(lo <= hi){
        int mid = lo + (hi-lo)/2;
        int cmp = arr[mid] - key;
        if(cmp > 0) hi = mid - 1;
        else lo = mid +1;
    }
    if(hi < n && arr[hi] == key) return hi;
    return -1;
}
```
### 查找第一个等于或者大于Key的元素
**如果有多个等于Key的值，返回最左边元素的下标; 否则返回大于Key的最左边元素下标**
```cpp
int binarySearch(const int *arr,int n,int key){
    int lo = 0,hi = n-1;
    while(lo <= hi){
        int mid = lo + (hi-lo)/2;
        int cmp = arr[mid] - key;
        if(cmp < 0) lo = mid +1;
        else hi = mid - 1;
    }
    return lo;
}
```
### 查找最后一个等于或者大于Key的元素
**如果有多个等于Key的元素，返回最右边元素的下标；否则返回小于Key的最右边元素下标**
```cpp
int binarySearch(const int *arr,int n,int key){
    int lo = 0,hi = n-1;
    while(lo <= hi){
        int mid = lo + (hi-lo)/2;
        int cmp = arr[mid] - key;
        if(cmp > 0) hi = mid - 1;
        else lo = mid +1;
    }
    return hi;
}
```
