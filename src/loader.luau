local process = require("@lune/process")
local jsonEncode = require("@lune/net").jsonEncode

local possibleErrors = {
	FILE_NOT_FOUND = "No file exist at the path",
	NOT_A_MODULE = "Module must return at least one value",
}

local _, resolvedMod = xpcall(function()
	-- [1] - Path to import
	-- [2] - Whether module import or not

	local mod = require(process.args[1])

	if process.args[2] == "MODULE" and mod == nil then
		error(possibleErrors.NOT_A_MODULE)
	end

	return mod
end, function(err)
	-- We only need the msg, not trace
	local errMsg = tostring(err):split("stack traceback:")[1]

	for id, msg in possibleErrors do
		if errMsg:match(msg) then
			print(`[bun-loader-lune::ImportError::{id}] ` .. errMsg)
			return
		end
	end

	print("-- [ImportError] --")
	print(tostring(err))
end)

if process.args[2] == "MODULE" and typeof(resolvedMod) == "table" then
	local modReprJson = jsonEncode(resolvedMod)

	print("--start @generated JS compatible object--")
	print(modReprJson)
	print("--end @generated JS compatible object--")
end
