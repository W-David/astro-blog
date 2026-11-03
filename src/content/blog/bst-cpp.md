---
title: "搜索二叉树(c++ implementation)"
description: "二叉搜索树的 C++ 实现笔记。"
pubDate: 2020-02-05
category: "算法"
tags:
  - "数据结构"
---

# 二叉搜索树简要介绍
## 二叉搜索树的定义
> 二叉搜索树又叫二叉查找树， 它或者是一棵空树，或者是具有下列性质的二叉树：

* 若它的左子树不空，则左子树上所有结点的值均小于它的根结点的值；
* 若它的右子树不空，则右子树上所有结点的值均大于它的根结点的值；
* 它的左、右子树也分别为二叉搜索树。
> **说明**
>
> 树的种类很多，除了二叉搜索树(BST),还有平衡二叉树（AVL）,红黑树，B树，B+树等等。

# 二叉搜索树的实现
## 数据结构及接口的定义
* 添加了父节点的指针，便于实现删除操作。（也可以使用引用）<br>
**节点的定义如下**
```cpp
typedef struct node *nodePtr;
static nodePtr root;
struct node{
    int val;
    nodePtr parent;
    nodePtr left{};
    nodePtr right{};
    explicit node(int val,nodePtr parent){this->val = val;this->parent = parent;}
};
```
* 树的遍历都是老生常谈的话题了，这里不再赘述。主要实现的树的插入，构造，删除等操作。<br>
**实现的接口如下**
```cpp
nodePtr find(int val,nodePtr np);
nodePtr findMax(nodePtr np);
nodePtr findMin(nodePtr np);
nodePtr insert(int val,nodePtr np,nodePtr pnt);
nodePtr CreateBST(const vector<int> &vc);
void adjustNode(nodePtr &np,nodePtr &tnp); //引用，修改节点
int deleteMin(nodePtr np);
void deleteNode(int val);
void levelTraverse();
void inOrderTraverse(nodePtr np);
```
## CODE ⇩⇩⇩
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef struct node *nodePtr;
static nodePtr root;
struct node{
    int val;
    nodePtr parent;
    nodePtr left{};
    nodePtr right{};
    explicit node(int val,nodePtr parent){this->val = val;this->parent = parent;}
};
nodePtr find(int val,nodePtr np){
    if(np == nullptr) return nullptr;
    if(np->val == val) return np;
    if(val < np->val) return find(val,np->left);
    else return find(val,np->right);
}
nodePtr findMax(nodePtr np){
    if(np == nullptr) return nullptr;
    if(np->right == nullptr) return np;
    return findMax(np->right);
}
nodePtr findMin(nodePtr np){
    if(np == nullptr) return nullptr;
    if(np->left == nullptr) return np;
    return findMin(np->left);
}
nodePtr insert(int val,nodePtr np,nodePtr pnt){
    if(np == nullptr) return new node(val,pnt);
    if(val < np->val) np->left = insert(val,np->left,np);
    else np->right = insert(val,np->right,np);
    return np;
}
nodePtr CreateBST(const vector<int> &vc){
    for(int i: vc) root = insert(i,root,nullptr);
    return root;
}
void adjustNode(nodePtr &np,nodePtr &tnp){
    (np->val < np->parent->val ? np->parent->left : np->parent->right) = tnp;
    if(tnp) tnp->parent = np->parent;
    delete np;
}
int deleteMin(nodePtr np){
    nodePtr minPtr = findMin(np);
    int minVal = minPtr->val;
    adjustNode(minPtr,minPtr->right);
    return minVal;
}
void deleteNode(int val){
    nodePtr np = find(val, root);
    if(np == nullptr) return;
    if(np->left == nullptr) adjustNode(np, np->right);
    else if(np->right == nullptr) adjustNode(np,np->left);
    else np->val = deleteMin(np->right);
}
void levelTraverse(){
    queue<nodePtr> levelQueue;
    levelQueue.push(root);
    while(!levelQueue.empty()){
        nodePtr cur = levelQueue.front();
        cout<<(cur->val)<<" ";
        if(cur->left) levelQueue.push(cur->left);
        if(cur->right) levelQueue.push(cur->right);
        levelQueue.pop();
    }
    cout<<endl;
}
void inOrderTraverse(nodePtr np){
    if(np == nullptr) return;
    inOrderTraverse(np->left);
    cout<<np->val<<" ";
    inOrderTraverse(np->right);
}
int main() {
    int lis[10] = {88,70,61,96,120,90,65,75,93,100};
    vector<int>  vc(lis,lis+10);
    root = CreateBST(vc);
    levelTraverse();
    inOrderTraverse(root); cout<<endl;
    deleteNode(96);
    deleteNode(70);
    deleteNode(88);
    deleteNode(11);
    levelTraverse();
    inOrderTraverse(root); cout<<endl;
    return 0;
}

```
