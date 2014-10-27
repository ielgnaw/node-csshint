/**
 * @file min-font-size 的检测逻辑
 *       037: [强制] 需要在 Windows 平台显示的中文内容，其字号应不小于 `12px`。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

var msg = 'font-size should not be less than ';

/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function checkProperty(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleVal = me.ruleVal;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    var propertyName = event.property.toString();
    if (propertyName === 'font-size') {
        var parts = event.value.parts;
        var len = parts.length;
        for (var i = 0; i < len; i++) {
            var part = parts[i];
            var line = part.line;
            var lineContent = util.getLineContent(line, fileContent);
            var col = part.col;
            if (part.value < ruleVal) {
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
                    col: col,
                    message: '`'
                        + lineContent
                        + '` '
                        + msg
                        + ruleVal
                        + 'px',
                    colorMessage: '`'
                        + util.changeColorByIndex(lineContent, col - 1, part.text)
                        + '` '
                        + chalk.grey(
                            msg + ruleVal + 'px'
                        )
                });
            }
        }
    }
}

/**
 * 模块的输出接口
 * hint 目录下的多个文件在 addListener 时，相同的 eventType 会 add 多次
 * 这是没有关系的，在 parserlib 在 fire 的时候，会一个一个的执行
 *
 * @param {Object} parser parserlib.css.Parser 实例
 * @param {string} fileContent 当前检测文件内容
 * @param {string} ruleName 当前检测的规则名称
 * @param {string} ruleVal 当前检测规则对应的配置值
 * @param {Array.<Object>} invalidList 不合法文件集合
 */
module.exports = function (parser, fileContent, ruleName, ruleVal, invalidList) {

    if (!ruleVal || isNaN(ruleVal)) {
        return invalidList;
    }

    parser.addListener(
        'property',
        checkProperty.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    return invalidList;
};