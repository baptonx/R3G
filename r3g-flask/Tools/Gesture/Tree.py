from typing import Any


class Node:
    def __init__(self, value: Any, children=None):
        if children is None:
            children = []
        self.value = value
        self.children = children

    def addChild(self, node: 'Node'):
        self.children.append(node)

    def __repr__(self):
        return str(self)

    def __str__(self):
        return str(self.value)


class Tree:
    def __init__(self, topNode: Node):
        self.topNode = topNode
