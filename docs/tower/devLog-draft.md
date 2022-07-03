## demo阶段


### 具体需求：复用战斗逻辑代码块

- 战斗预测函数fun_calculateBattle。输入对战双方属性(见feature-1)，计算战斗预测，询问玩家是否战斗。若确认战斗，则跳转至战斗结算函数。
- 战斗结算函数fun_afterBattle。将预测时算出的血量损失和获得金钱修改玩家属性，移除怪物SPR(见feature-2)。

### feature-1: 在dlg的限制下，实现“函数”

约定一些varId用于参数传递。dlg_caller填充这些varId，dlg_function使用这些varId做逻辑。

这有点像《游戏编程模式》里的“字节码”，在那里有一个功能受限的虚拟机，函数从寄存器中取参数。在Bitsy里，函数从约定的varId取参数。

以前：
```
DLG dlg_function
"""
I use value: {print var_singletonValue}
"""

VAR var_singletonValue
```

修改后：
```
DLG dlg_caller_a
"""
{var_functionArg_value = var_value_a}
(jump "dlg_function")
"""

DLG dlg_caller_b
"""
{var_functionArg_value = var_value_b}
(jump "dlg_function")
"""

DLG dlg_function
"""
I use value: {print var_functionArg_value}
"""

VAR var_functionArg_value
VAR var_value_a
VAR var_value_b
```

### feature-2: 在dlg的限制下，实现“传TIL/SPR引用”

dlg_caller填充varId，其值是sprId。dlg_function调用某些涉及spr的hackFunction需要传sprId时，希望sprId不是固定的，而是来自varId的值。

复制hackFunction源码，略微修改，得到新的hackFunctionByPointer。

hack代码修改：
```js
addDialogTag('hackFunction', function (environment, parameters) {
    var targetId = params[0].trim();
    ……
});

addDialogTag('hackFunctionByPointer', function (environment, parameters) {
    var targetPointer = params[0].trim();
    var targetId = environment.GetVariable(targetPointer);
    ……
});
```

以前：
```
DLG dlg_function
"""
(hackFunction "spr_a")
"""
```

修改后：
```
DLG dlg_caller_b
"""
{var_functionArg_sprPointer = "spr_b"}
(jump "dlg_function")
"""

DLG dlg_caller_a
"""
{var_functionArg_sprPointer = "spr_a"}
(jump "dlg_function")
"""

DLG dlg_function
"""
(hackFunctionByPointer "var_functionArg_sprPointer")
"""
```

### feature-3: 在spr的限制下，实现“实例化”

试想在(room1, x2, y1)和(room2, x2, y2)分别有史莱姆的两个实例，如何实现？

方案1：
令史莱姆作为ITM，则需要用某种hack阻止玩家直接拾起他，而是像SPR一样先对话。需要用某种hack获取引发对话的ITM所在的(room, x, y)，传递参数到战斗函数里，待玩家确认战斗后通过hack移除(room, x, y)上的这个TIL。

方案2：
令史莱姆作为SPR，则有spr_instance_1和spr_instance_2。spr_instance_1的dlg_instance_1会将room1和spr_instance_1传递参数到战斗函数里，待玩家确认战斗后通过hack移除(room1上的)所有spr_instance_1。

最终采用方案2，认为其更好理解和维护。

```
DLG dlg_slime_instance_1
"""
{var_functionArg_sprPointer = "spr_slime_instance_1"}
{var_functionArg_atk = 35}
{var_functionArg_def = 10}
{var_functionArg_hp = 200}
(jump "fun_calculateBattle")
"""

DLG dlg_slime_instance_2
"""
{var_functionArg_sprPointer = "spr_slime_instance_2"}
{var_functionArg_atk = 35}
{var_functionArg_def = 10}
{var_functionArg_hp = 200}
(jump "fun_calculateBattle")
"""
```

进一步优化，区分类的static变量和实例变量，增加复用。

```
DLG dlg_slime_instance_1
"""
{var_functionArg_sprPointer = "spr_slime_instance_1"}
(jump "dlg_slime_static")
"""

DLG dlg_slime_instance_2
"""
{var_functionArg_sprPointer = "spr_slime_instance_2"}
(jump "dlg_slime_static")
"""

DLG dlg_slime_static
"""
{var_functionArg_atk = 35}
{var_functionArg_def = 10}
{var_functionArg_hp = 200}
(jump "fun_calculateBattle")
"""
```

### feature-4: PR js-hack

https://github.com/seleb/bitsy-hacks/pull/181

"""
{let_calculateBattle_ememyWinTurn = member_player_HP / let_calculateBattle_ememyDamagePerTurn}
let_calculateBattle_playerWinTurn = (jsNow "Math.ceil(scriptInterpreter.GetVariable('let_calculateBattle_playerWinTurn'))")
"""

### feature-5: 使用bitsy-bolilerplate管理hackFunctionByPointer

如上所述，基于hackFunction写出了hackFunctionByPointer，属于自定义hack，常规的hack整合工具已不够用。故fork并拓展了bitsy-bolilerplate。

例如，基于`edit image from dialog.js`中的image写出了imageByPointerNow，位于同一个文件。则另存为`'modifiedHacks/edit image from dialog.js'`

对`inoput/hacks.js`，

> import '@bitsy/hecks/src/edit image from dialog';

改为

> import '../modifiedHacks/edit image from dialog';



